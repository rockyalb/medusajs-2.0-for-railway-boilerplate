const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

const source = fs.readFileSync(
  path.join(__dirname, "../src/lib/meta-pixel.ts"),
  "utf8"
)

test("returning from a non-product page records a new product view", () => {
  const browser = createBrowser()
  const loaded = loadModule(browser)
  try {
    const track = loaded.module.trackMetaEvent
    track("PageView")
    track("ViewContent", { content_ids: ["variant_1"] })
    browser.window.location.pathname = "/store"
    track("PageView")
    browser.window.location.pathname = "/products/test-product"
    track("ViewContent", { content_ids: ["variant_1"] })
    track("PageView")
    track("ViewContent", { content_ids: ["variant_1"] })
    assert.equal(browser.window.fbq.queue.filter(args => args[1] === "ViewContent").length, 2)
  } finally { loaded.cleanup() }
})
const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText

function createBrowser(search = "", readyState = "complete") {
  const scripts = []
  const idleCallbacks = []
  const cancelledIdleCallbacks = []
  const listeners = new Map()
  const cookies = new Map()
  let cookieWrites = 0

  const document = {
    readyState,
    head: { appendChild: (script) => scripts.push(script) },
    body: { appendChild: (script) => scripts.push(script) },
    createElement: () => {
      const script = {
        async: false,
        id: "",
        src: "",
        onerror: undefined,
        onload: undefined,
        remove() {
          const index = scripts.indexOf(script)
          if (index >= 0) scripts.splice(index, 1)
        },
      }
      return script
    },
    getElementById: (id) => scripts.find((script) => script.id === id) || null,
    querySelector: () =>
      scripts.find(
        (script) =>
          script.src === "https://connect.facebook.net/en_US/fbevents.js"
      ) || null,
  }

  Object.defineProperty(document, "cookie", {
    get() {
      return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ")
    },
    set(value) {
      cookieWrites += 1
      const [pair] = value.split(";")
      const separator = pair.indexOf("=")
      cookies.set(pair.slice(0, separator), pair.slice(separator + 1))
    },
  })

  const window = {
    location: { pathname: "/products/test-product", search },
    setTimeout,
    clearTimeout,
    requestIdleCallback(callback, options) {
      idleCallbacks.push({ callback, options })
      return idleCallbacks.length
    },
    cancelIdleCallback(id) {
      cancelledIdleCallbacks.push(id)
    },
    addEventListener(name, callback) {
      const callbacks = listeners.get(name) || []
      callbacks.push(callback)
      listeners.set(name, callbacks)
    },
    removeEventListener(name, callback) {
      const callbacks = listeners.get(name) || []
      listeners.set(
        name,
        callbacks.filter((registered) => registered !== callback)
      )
    },
  }

  return {
    window,
    document,
    scripts,
    idleCallbacks,
    cancelledIdleCallbacks,
    dispatch(name) {
      for (const callback of [...(listeners.get(name) || [])]) callback()
    },
    get cookieWrites() {
      return cookieWrites
    },
  }
}

function loadModule(browser) {
  const previousWindow = global.window
  const previousDocument = global.document
  const previousPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  process.env.NEXT_PUBLIC_META_PIXEL_ID = "pixel-test"
  global.window = browser.window
  global.document = browser.document

  const module = { exports: {} }
  new Function("require", "module", "exports", code)(
    require,
    module,
    module.exports
  )

  return {
    module: module.exports,
    cleanup() {
      if (previousPixelId === undefined) {
        delete process.env.NEXT_PUBLIC_META_PIXEL_ID
      } else {
        process.env.NEXT_PUBLIC_META_PIXEL_ID = previousPixelId
      }
      global.window = previousWindow
      global.document = previousDocument
    },
  }
}

test("events queue before the library is ready and lifecycle effects are deduplicated", () => {
  const browser = createBrowser()
  const loaded = loadModule(browser)

  try {
    const { trackMetaEvent } = loaded.module
    const productPayload = { content_ids: ["variant_1"] }

    trackMetaEvent("PageView")
    trackMetaEvent("ViewContent", productPayload)
    // React StrictMode can interleave effects from the root and product trees.
    // Deduplication must be scoped per event type, rather than one global key.
    trackMetaEvent("PageView")
    trackMetaEvent("ViewContent", { content_ids: ["variant_1"] })
    trackMetaEvent("AddToCart", productPayload)
    trackMetaEvent("AddToCart", productPayload)

    const queue = browser.window.fbq.queue
    assert.deepEqual(queue[0], ["init", "pixel-test"])
    assert.equal(
      queue.filter(
        ([command, name]) => command === "track" && name === "PageView"
      ).length,
      1
    )
    assert.equal(
      queue.filter(
        ([command, name]) => command === "track" && name === "ViewContent"
      ).length,
      1
    )
    assert.equal(
      queue.filter(
        ([command, name]) => command === "track" && name === "AddToCart"
      ).length,
      2
    )
  } finally {
    loaded.cleanup()
  }
})

test("purchase event IDs are deduplicated across remounts while new IDs track", () => {
  const browser = createBrowser()
  const loaded = loadModule(browser)

  try {
    const { trackMetaEvent } = loaded.module
    trackMetaEvent("Purchase", { value: 10 }, { eventID: "purchase.1" })
    trackMetaEvent("Purchase", { value: 10 }, { eventID: "purchase.1" })
    trackMetaEvent("Purchase", { value: 12 }, { eventID: "purchase.2" })

    const purchases = browser.window.fbq.queue.filter(
      ([command, name]) => command === "track" && name === "Purchase"
    )
    assert.equal(purchases.length, 2)
    assert.deepEqual(
      purchases.map(([, , , options]) => options.eventID),
      ["purchase.1", "purchase.2"]
    )
  } finally {
    loaded.cleanup()
  }
})

test("attribution cookies are created once and retain the same click timestamp", () => {
  const browser = createBrowser("?fbclid=click-1")
  const loaded = loadModule(browser)

  try {
    const { ensureFacebookCookies } = loaded.module
    ensureFacebookCookies()
    const firstCookies = browser.document.cookie
    const firstWriteCount = browser.cookieWrites

    ensureFacebookCookies()
    assert.equal(browser.document.cookie, firstCookies)
    assert.equal(browser.cookieWrites, firstWriteCount)

    browser.window.location.search = "?fbclid=click-2"
    ensureFacebookCookies()
    assert.match(browser.document.cookie, /fbclid=click-2/)
    assert.equal(browser.cookieWrites, firstWriteCount + 2)
  } finally {
    loaded.cleanup()
  }
})

test("Meta library loading waits for idle and reuses one in-flight script", async () => {
  const browser = createBrowser()
  const loaded = loadModule(browser)

  try {
    const { scheduleMetaPixelLoad, loadMetaPixelScript } = loaded.module
    const cleanup = scheduleMetaPixelLoad()

    assert.equal(browser.idleCallbacks.length, 1)
    assert.equal(browser.idleCallbacks[0].options.timeout, 2000)
    assert.equal(browser.scripts.length, 0)

    browser.idleCallbacks[0].callback({ didTimeout: false })
    assert.equal(browser.scripts.length, 1)
    assert.equal(browser.scripts[0].async, true)
    assert.equal(
      browser.scripts[0].src,
      "https://connect.facebook.net/en_US/fbevents.js"
    )

    const firstPromise = loadMetaPixelScript()
    const secondPromise = loadMetaPixelScript()
    assert.strictEqual(firstPromise, secondPromise)

    browser.scripts[0].onload()
    await firstPromise
    cleanup()
  } finally {
    loaded.cleanup()
  }
})

test("Meta library waits for the initial load event before scheduling idle work", () => {
  const browser = createBrowser("", "loading")
  const loaded = loadModule(browser)

  try {
    const cleanup = loaded.module.scheduleMetaPixelLoad()
    assert.equal(browser.idleCallbacks.length, 0)
    assert.equal(browser.scripts.length, 0)

    browser.dispatch("load")
    assert.equal(browser.idleCallbacks.length, 1)
    cleanup()
  } finally {
    loaded.cleanup()
  }
})
