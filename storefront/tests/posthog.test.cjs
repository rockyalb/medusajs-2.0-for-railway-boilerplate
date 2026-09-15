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
function loadModule({
  configured = true,
  localStorage = createLocalStorage(),
} = {}) {
  const captures = []
  const identifies = []
  const resets = []
  const inits = []

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
    init: (...args) => inits.push(args),
    capture: (...args) => captures.push(args),
    identify: (...args) => identifies.push(args),
    reset: (...args) => resets.push(args),
  }

  const module = { exports: {} }
  const requireStub = (specifier) =>
    specifier === "posthog-js/no-external"
      ? { default: stub, ...stub }
      : require(specifier)

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
    inits,
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

test("an unconfigured environment sends nothing instead of throwing", async () => {
  const loaded = loadModule({ configured: false })

  try {
    await loaded.module.trackPostHogEvent("product_added_to_cart", {
      quantity: 1,
    })
    await loaded.module.trackPostHogEventOnce("order:1", "order_completed", {})
    await loaded.module.identifyPostHogCustomer("cus_1", {})
    await loaded.module.resetPostHog()

    assert.equal(loaded.module.POSTHOG_ENABLED, false)
    assert.deepEqual(loaded.captures, [])
    assert.deepEqual(loaded.identifies, [])
    assert.deepEqual(loaded.resets, [])
  } finally {
    loaded.cleanup()
  }
})

test("a configured environment forwards the event name and payload", async () => {
  const loaded = loadModule()

  try {
    await loaded.module.trackPostHogEvent("cart_quantity_changed", {
      variant_id: "variant_1",
      quantity: 3,
    })

    assert.equal(loaded.captures.length, 1)
    assert.deepEqual(loaded.captures[0], [
      "cart_quantity_changed",
      { variant_id: "variant_1", quantity: 3 },
    ])
    assert.equal(loaded.inits.length, 1)
    assert.deepEqual(
      {
        autocapture: loaded.inits[0][1].autocapture,
        capture_dead_clicks: loaded.inits[0][1].capture_dead_clicks,
        capture_exceptions: loaded.inits[0][1].capture_exceptions,
        capture_performance: loaded.inits[0][1].capture_performance,
        disable_session_recording: loaded.inits[0][1].disable_session_recording,
        disable_surveys: loaded.inits[0][1].disable_surveys,
        disable_external_dependency_loading:
          loaded.inits[0][1].disable_external_dependency_loading,
      },
      {
        autocapture: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_external_dependency_loading: true,
      }
    )
  } finally {
    loaded.cleanup()
  }
})

test("a confirmed order is counted once across reloads but each order still counts", async () => {
  const localStorage = createLocalStorage()
  const first = loadModule({ localStorage })

  try {
    await first.module.trackPostHogEventOnce(
      "order_completed:order_1",
      "order_completed",
      {
        order_id: "order_1",
        value: 4200,
      }
    )
    // The shopper reloads the confirmation page in the same session.
    await first.module.trackPostHogEventOnce(
      "order_completed:order_1",
      "order_completed",
      {
        order_id: "order_1",
        value: 4200,
      }
    )

    assert.equal(first.captures.length, 1)
    assert.equal(first.captures[0][1].order_id, "order_1")
  } finally {
    first.cleanup()
  }

  // A later visit reuses the same browser storage, so the old order stays
  // suppressed while a genuinely new order is still recorded.
  const second = loadModule({ localStorage })

  try {
    await second.module.trackPostHogEventOnce(
      "order_completed:order_1",
      "order_completed",
      {
        order_id: "order_1",
      }
    )
    await second.module.trackPostHogEventOnce(
      "order_completed:order_2",
      "order_completed",
      {
        order_id: "order_2",
      }
    )

    assert.equal(second.captures.length, 1)
    assert.equal(second.captures[0][1].order_id, "order_2")
  } finally {
    second.cleanup()
  }
})

test("blocked browser storage records the conversion rather than dropping it", async () => {
  const loaded = loadModule({
    localStorage: createLocalStorage({ throws: true }),
  })

  try {
    await loaded.module.trackPostHogEventOnce(
      "order_completed:order_1",
      "order_completed",
      {
        order_id: "order_1",
      }
    )

    assert.equal(loaded.captures.length, 1)
  } finally {
    loaded.cleanup()
  }
})

test("identify and reset reach the SDK when configured", async () => {
  const loaded = loadModule()

  try {
    await loaded.module.identifyPostHogCustomer("cus_1", {
      email: "shopper@example.com",
    })
    await loaded.module.resetPostHog()

    assert.deepEqual(loaded.identifies, [
      ["cus_1", { email: "shopper@example.com" }],
    ])
    assert.equal(loaded.resets.length, 1)
  } finally {
    loaded.cleanup()
  }
})
