const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

// Load the server action with isolated SDK/cookie/Next dependencies. No network
// calls or database setup/teardown are involved in this suite.
function fixture({
  unavailable = false,
  shippingError = false,
  total = 1240,
  providers = ["pp_system_default"],
  completionError = false,
} = {}) {
  const calls = []
  let cart = {
    id: "cart_test",
    region_id: "reg_al",
    currency_code: "all",
    total,
    shipping_methods: [],
  }
  const record =
    (name, fn) =>
    async (...args) => {
      calls.push(name)
      return fn(...args)
    }
  const sdk = {
    store: {
      cart: {
        update: record("address", (_, data) => {
          cart = { ...cart, ...data }
          return { cart }
        }),
        addShippingMethod: record("shipping", (_, data) => {
          if (shippingError) throw new Error("Shipping unavailable")
          cart = {
            ...cart,
            shipping_methods: [{ shipping_option_id: data.option_id }],
            shipping_total: 240,
          }
          return { cart }
        }),
        retrieve: record("retrieve", () => ({ cart })),
      },
      fulfillment: {
        listCartOptions: record("options", () => ({
          shipping_options: unavailable
            ? []
            : [
                {
                  id: "unavailable",
                  amount: 0,
                  insufficient_inventory: true,
                  type: { code: "free-delivery" },
                },
                {
                  id: "not-priced",
                  amount: null,
                  type: { code: "free-delivery" },
                },
                {
                  id: "delivery",
                  amount: 240,
                  type: { code: "tirane-delivery" },
                },
              ],
        })),
      },
      payment: {
        listPaymentProviders: record("providers", () => ({
          payment_providers: providers.map((id) => ({ id })),
        })),
        initiatePaymentSession: record("payment", (value, data) => {
          assert.equal(data.provider_id, "pp_system_default")
          assert.equal(value.total, total)
        }),
      },
    },
  }
  const mocks = {
    "@lib/config": { sdk },
    "next/cache": { updateTag: () => {} },
    "next/navigation": {
      unstable_rethrow: (error) => {
        if (error.redirect) throw error
      },
    },
    "./cookies": {
      getCartId: async () => "cart_test",
      getAuthHeaders: async () => ({}),
    },
    "./cart": {
      transferCartToCustomer: record("transfer", () => {}),
      placeOrder: record("complete", () => {
        if (completionError) throw new Error("Stock no longer available")
        throw Object.assign(new Error("confirmation redirect"), {
          redirect: true,
        })
      }),
    },
  }
  const source = fs.readFileSync(
    path.join(__dirname, "../src/lib/data/checkout.ts"),
    "utf8"
  )
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const module = { exports: {} }
  new Function("require", "module", "exports", output)(
    (name) => {
      assert.ok(name in mocks, `Unexpected dependency: ${name}`)
      return mocks[name]
    },
    module,
    module.exports
  )
  const form = new FormData()
  Object.entries({
    first_name: "Test",
    last_name: "Customer",
    address_1: "Rruga Test",
    city: "Tiranë",
    country_code: "al",
    phone: "0690000000",
  }).forEach(([key, value]) => form.set(`shipping_address.${key}`, value))
  form.set("same_as_billing", "on")
  form.set("email", "checkout@example.test")
  return {
    ...module.exports,
    calls,
    form,
    cart: () => cart,
    expected: { total, currency: "all", shippingOptionId: "delivery" },
  }
}

test("autosave updates addresses and eligible shipping without creating an order or payment", async () => {
  const f = fixture()
  const result = await f.prepareCheckout(f.form)
  assert.equal(result.error, undefined)
  assert.equal(result.cart.shipping_methods[0].shipping_option_id, "delivery")
  assert.deepEqual(f.calls, ["transfer", "address", "options", "shipping"])
  assert.deepEqual(f.cart().billing_address, f.cart().shipping_address)
})

test("partial contact fields can quote shipping, but cannot complete", async () => {
  const f = fixture()
  f.form.delete("email")
  f.form.delete("shipping_address.first_name")
  assert.ok((await f.prepareCheckout(f.form)).cart)
  const result = await f.completeCodCheckout(f.form, f.expected)
  assert.ok(result.error)
  assert.ok(!f.calls.includes("complete"))
})

test("COD initializes only after shipping totals refresh, then preserves completion redirect", async () => {
  const f = fixture()
  await assert.rejects(f.completeCodCheckout(f.form, f.expected), {
    redirect: true,
  })
  assert.deepEqual(f.calls, [
    "transfer",
    "address",
    "options",
    "shipping",
    "providers",
    "payment",
    "retrieve",
    "complete",
  ])
})

for (const field of ["total", "currency", "shippingOptionId"]) {
  test(`changed ${field} requires customer review of the new total before completion`, async () => {
    const f = fixture()
    const result = await f.completeCodCheckout(f.form, {
      ...f.expected,
      [field]: field === "total" ? 1000 : "changed",
    })
    assert.ok(result.error)
    assert.ok(result.cart)
    assert.ok(!f.calls.includes("complete"))
  })
}

for (const options of [
  { unavailable: true },
  { shippingError: true },
  { providers: ["pp_stripe_stripe"] },
]) {
  test(`unavailable delivery/COD prevents completion: ${JSON.stringify(
    options
  )}`, async () => {
    const f = fixture(options)
    const result = await f.completeCodCheckout(f.form, f.expected)
    assert.ok(result.error)
    assert.ok(!f.calls.includes("complete"))
  })
}

test("completion errors remain visible and retryable", async () => {
  const f = fixture({ completionError: true })
  const result = await f.completeCodCheckout(f.form, f.expected)
  assert.equal(result.error, "Stock no longer available")
})

test("separate billing details are saved and validated", async () => {
  const f = fixture()
  f.form.delete("same_as_billing")
  assert.ok((await f.completeCodCheckout(f.form, f.expected)).error)
  for (const [key, value] of [...f.form.entries()]) {
    if (key.startsWith("shipping_address."))
      f.form.set(key.replace("shipping_address.", "billing_address."), value)
  }
  f.form.set("billing_address.city", "Durrës")
  assert.ok((await f.prepareCheckout(f.form)).cart)
  assert.equal(f.cart().billing_address.city, "Durrës")
  assert.equal(f.cart().shipping_address.city, "Tiranë")
})

test("checkout does not require a postal code", async () => {
  const f = fixture()
  assert.equal(f.form.has("shipping_address.postal_code"), false)
  await assert.rejects(f.completeCodCheckout(f.form, f.expected), {
    redirect: true,
  })
})

test("Tirane, Tiranë and Tirana share the lower delivery group in both backend hooks", () => {
  const callbacks = []
  const hook = {
    hooks: { setShippingOptionsContext: (fn) => callbacks.push(fn) },
  }
  const source = fs.readFileSync(
    path.join(
      __dirname,
      "../../backend/src/workflows/hooks/shipping-options-context.ts"
    ),
    "utf8"
  )
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const module = { exports: {} }
  new Function("require", "module", "exports", output)(
    (name) => {
      if (name === "@medusajs/medusa/core-flows")
        return {
          listShippingOptionsForCartWorkflow: hook,
          listShippingOptionsForCartWithPricingWorkflow: hook,
        }
      if (name === "@medusajs/framework/workflows-sdk")
        return {
          StepResponse: class {
            constructor(data) {
              this.data = data
            }
          },
        }
      throw new Error(`Unexpected dependency: ${name}`)
    },
    module,
    module.exports
  )
  assert.equal(callbacks.length, 2)
  for (const callback of callbacks) {
    for (const city of ["Tirane", "Tiranë", "Tirana", " TIRANA ", "tiranë"]) {
      assert.equal(
        callback({ cart: { shipping_address: { city } } }).data
          .delivery_city_group,
        "tirane",
        city
      )
    }
    for (const city of [
      "Durrës",
      "Vlorë",
      "Tirana e Re",
      "",
      null,
      undefined,
    ]) {
      assert.equal(
        callback({ cart: { shipping_address: { city } } }).data
          .delivery_city_group,
        "other",
        String(city)
      )
    }
  }
})
