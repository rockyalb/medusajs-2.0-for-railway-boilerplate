const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

const source = fs.readFileSync(
  path.join(__dirname, "../src/lib/posthog.ts"),
  "utf8"
)

const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText

function createLocalStorage({ throws = false } = {}) {
  const entries = new Map()

  return {
    entries,
    getItem(key) {
      if (throws) {
        throw new Error("storage blocked")
      }
      return entries.has(key) ? entries.get(key) : null
    },
    setItem(key, value) {
      if (throws) {
        throw new Error("storage blocked")
      }
      entries.set(key, String(value))
    },
  }
}

// The singleton is stubbed so the assertions describe what the helpers decided
// to send, independent of the real SDK's transport.
function loadModule({ configured = true, localStorage = createLocalStorage() } = {}) {
  const captures = []
  const identifies = []
  const resets = []

  const previousWindow = global.window
  const previousToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const previousHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (configured) {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "phc_test"
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://eu.i.posthog.com"
  } else {
    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST
  }

  global.window = { localStorage }

  const stub = {
    capture: (...args) => captures.push(args),
    identify: (...args) => identifies.push(args),
    reset: (...args) => resets.push(args),
  }

  const module = { exports: {} }
  const requireStub = (specifier) =>
    specifier === "posthog-js" ? { default: stub, ...stub } : require(specifier)

  new Function("require", "module", "exports", code)(
    requireStub,
    module,
    module.exports
  )

  return {
    module: module.exports,
    captures,
    identifies,
    resets,
    cleanup() {
      global.window = previousWindow
      restoreEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", previousToken)
      restoreEnv("NEXT_PUBLIC_POSTHOG_HOST", previousHost)
    },
  }
}

function restoreEnv(key, value) {
  if (value === undefined) {
    delete process.env[key]
  } else {
    process.env[key] = value
  }
}

test("an unconfigured environment sends nothing instead of throwing", () => {
  const loaded = loadModule({ configured: false })

  try {
    loaded.module.trackPostHogEvent("product_added_to_cart", { quantity: 1 })
    loaded.module.trackPostHogEventOnce("order:1", "order_completed", {})
    loaded.module.identifyPostHogCustomer("cus_1", {})
    loaded.module.resetPostHog()

    assert.equal(loaded.module.POSTHOG_ENABLED, false)
    assert.deepEqual(loaded.captures, [])
    assert.deepEqual(loaded.identifies, [])
    assert.deepEqual(loaded.resets, [])
  } finally {
    loaded.cleanup()
  }
})

test("a configured environment forwards the event name and payload", () => {
  const loaded = loadModule()

  try {
    loaded.module.trackPostHogEvent("cart_quantity_changed", {
      variant_id: "variant_1",
      quantity: 3,
    })

    assert.equal(loaded.captures.length, 1)
    assert.deepEqual(loaded.captures[0], [
      "cart_quantity_changed",
      { variant_id: "variant_1", quantity: 3 },
    ])
  } finally {
    loaded.cleanup()
  }
})

test("a confirmed order is counted once across reloads but each order still counts", () => {
  const localStorage = createLocalStorage()
  const first = loadModule({ localStorage })

  try {
    first.module.trackPostHogEventOnce("order_completed:order_1", "order_completed", {
      order_id: "order_1",
      value: 4200,
    })
    // The shopper reloads the confirmation page in the same session.
    first.module.trackPostHogEventOnce("order_completed:order_1", "order_completed", {
      order_id: "order_1",
      value: 4200,
    })

    assert.equal(first.captures.length, 1)
    assert.equal(first.captures[0][1].order_id, "order_1")
  } finally {
    first.cleanup()
  }

  // A later visit reuses the same browser storage, so the old order stays
  // suppressed while a genuinely new order is still recorded.
  const second = loadModule({ localStorage })

  try {
    second.module.trackPostHogEventOnce("order_completed:order_1", "order_completed", {
      order_id: "order_1",
    })
    second.module.trackPostHogEventOnce("order_completed:order_2", "order_completed", {
      order_id: "order_2",
    })

    assert.equal(second.captures.length, 1)
    assert.equal(second.captures[0][1].order_id, "order_2")
  } finally {
    second.cleanup()
  }
})

test("blocked browser storage records the conversion rather than dropping it", () => {
  const loaded = loadModule({ localStorage: createLocalStorage({ throws: true }) })

  try {
    loaded.module.trackPostHogEventOnce("order_completed:order_1", "order_completed", {
      order_id: "order_1",
    })

    assert.equal(loaded.captures.length, 1)
  } finally {
    loaded.cleanup()
  }
})

test("identify and reset reach the SDK when configured", () => {
  const loaded = loadModule()

  try {
    loaded.module.identifyPostHogCustomer("cus_1", { email: "shopper@example.com" })
    loaded.module.resetPostHog()

    assert.deepEqual(loaded.identifies, [
      ["cus_1", { email: "shopper@example.com" }],
    ])
    assert.equal(loaded.resets.length, 1)
  } finally {
    loaded.cleanup()
  }
})
