const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")
const Medusa = require("@medusajs/js-sdk").default

function load(name, sdk, extras = {}) {
  const source = fs.readFileSync(path.join(__dirname, "../src/lib/data", name + ".ts"), "utf8")
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
  const mod = { exports: {} }
  const mocks = {
    "@lib/config": { sdk },
    "react": { cache: fn => fn },
    "next/cache": { updateTag() {} },
    "next/headers": {},
    "next/navigation": { redirect() {} },
    "@lib/util/medusa-error": { default: error => { throw error }, __esModule: true },
    "@lib/util/sort-products": { sortProducts: items => items },
    "./cookies": { getCartId: async () => "cart_test", getAuthHeaders: async () => ({ authorization: "Bearer test-token" }) },
    "./regions": { listRegions: async () => [{ id: "reg_al" }], getRegion: async () => ({ id: "reg_al", currency_code: "all" }) },
    "./products": { getProductsById: async () => [], getProductsList: async () => ({ response: { products: [] } }) },
    "./cart": { transferCartToCustomer() {} },
    ...extras,
  }
  new Function("require", "module", "exports", code)(id => id in mocks ? mocks[id] : require(id), mod, mod.exports)
  return mod.exports
}

test("cart reads stay fresh through the real SDK and deletion keeps authentication out of the URL", async t => {
  let cart = { id: "cart_test", region_id: "reg_al", items: [{ id: "cali_test", quantity: 1 }] }
  const dataCache = new Map()
  const requests = []
  t.mock.method(global, "fetch", async (input, init) => {
    const url = new URL(input)
    requests.push({ url, init })
    let body
    if (init.method === "POST") {
      cart.items[0].quantity = JSON.parse(init.body).quantity
      body = { cart }
    } else if (init.method === "DELETE") {
      cart.items = []
      body = { deleted: true, parent: cart }
    } else {
      // Reproduce an ISR segment caching GETs unless no-store reaches fetch.
      if (init.cache !== "no-store" && dataCache.has(url.href)) {
        body = dataCache.get(url.href)
      } else {
        body = structuredClone({ cart })
        dataCache.set(url.href, body)
      }
    }
    return Response.json(body)
  })
  const sdk = new Medusa({ baseUrl: "https://backend.test", publishableKey: "pk_test" })
  const actions = load("cart", sdk)
  assert.equal((await actions.retrieveCart()).items[0].quantity, 1)
  await actions.updateLineItem({ lineId: "cali_test", quantity: 2 })
  assert.equal((await actions.retrieveCart()).items[0].quantity, 2)
  await actions.deleteLineItem("cali_test")
  assert.deepEqual((await actions.retrieveCart()).items, [])
  for (const { url, init } of requests) {
    assert.equal(url.searchParams.has("authorization"), false)
    assert.equal(init.headers.get("authorization"), "Bearer test-token")
    assert.equal(init.headers.get("cache"), null)
    assert.equal(init.headers.get("next"), null)
    if (!init.method || init.method === "GET") assert.equal(init.cache, "no-store")
  }
})

test("catalog policies and personal no-store policies reach fetch, not HTTP headers", async t => {
  const requests = []
  t.mock.method(global, "fetch", async (url, init) => {
    requests.push({ url: new URL(url), init })
    return Response.json({ products: [], product_categories: [], collections: [], regions: [], region: {}, collection: {}, orders: [], order: {}, customer: {}, shipping_options: [], payment_providers: [], count: 0 })
  })
  const sdk = new Medusa({ baseUrl: "https://backend.test", publishableKey: "pk_test" })
  for (const [file, method, args, tag, ttl] of [
    ["products", "getProductsById", [{ ids: ["prod_test"], regionId: "reg_al" }], "products", 60],
    ["products", "getProductsList", [{ countryCode: "al" }], "products", 60],
    ["products", "getBestsellerProducts", ["al"], "homepage", 300],
    ["regions", "listRegions", [], "regions", 3600],
    ["regions", "retrieveRegion", ["reg_al"], "regions", 3600],
    ["collections", "retrieveCollection", ["col_test"], "collections", 3600],
    ["categories", "listCategories", [], "categories", 3600],
    ["customer", "getCustomer", []],
    ["orders", "retrieveOrder", ["order_test"]],
    ["orders", "listOrders", []],
    ["fulfillment", "listCartShippingMethods", ["cart_test"]],
    ["payment", "listCartPaymentMethods", ["reg_al"]],
  ]) {
    const before = requests.length
    await load(file, sdk)[method](...args)
    assert.equal(requests.length, before + 1, `${file}.${method} must fetch`)
    const { init } = requests.at(-1)
    assert.equal(init.headers.get("cache"), null)
    assert.equal(init.headers.get("next"), null)
    assert.equal(init.cache, tag ? "force-cache" : "no-store", method)
    if (tag) {
      assert.ok(init.next.tags.includes(tag), method)
      assert.equal(init.next.revalidate, ttl, method)
    }
  }
})
