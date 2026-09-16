const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")
const utils = require("@medusajs/framework/utils")

function load(file, mocks = {}) {
  const source = fs.readFileSync(path.resolve(__dirname, file), "utf8")
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const mod = { exports: {} }
  new Function("require", "module", "exports", code)(
    (id) => id in mocks ? mocks[id] : require(id), mod, mod.exports
  )
  return mod.exports
}

function environment(t) {
  for (const [key, value] of Object.entries({
    STOREFRONT_URL: "https://storefront.test/",
    REVALIDATE_SECRET: "test-secret",
    MEILISEARCH_HOST: "https://search.test",
    MEILISEARCH_ADMIN_KEY: "test-key",
  })) {
    const previous = process.env[key]
    process.env[key] = value
    t.after(() => previous === undefined ? delete process.env[key] : process.env[key] = previous)
  }
  t.mock.method(console, "error", () => {})
}

test("stock, reservations, prices, product edits and workflow completion all expire the cache", async () => {
  let requests = 0
  const subscriber = load("../src/subscribers/product-cache-invalidation.ts", {
    "../lib/product-search-sync": { expireStorefrontProductCache: async () => { requests++; return true } },
  })
  for (const name of [
    utils.InventoryEvents.INVENTORY_LEVEL_UPDATED,
    utils.InventoryEvents.INVENTORY_LEVEL_DELETED,
    utils.InventoryEvents.RESERVATION_ITEM_CREATED,
    utils.InventoryEvents.RESERVATION_ITEM_DELETED,
    utils.PricingEvents.PRICE_UPDATED,
    utils.PricingEvents.PRICE_LIST_UPDATED,
    utils.ProductEvents.PRODUCT_VARIANT_DELETED,
    utils.ProductEvents.PRODUCT_IMAGE_UPDATED,
    utils.ProductEvents.PRODUCT_OPTION_UPDATED,
    "product.updated", "product-variant.updated",
  ]) {
    assert.ok(subscriber.config.event.includes(name), name)
    // A deleted record or bulk event need not have a resolvable product ID.
    await subscriber.default({ event: { name, data: {} } })
  }
  assert.equal(requests, 11)
})

test("cache failures are retried and never reported as success", async () => {
  let requests = 0
  let succeeds = true
  const subscriber = load("../src/subscribers/product-cache-invalidation.ts", {
    "../lib/product-search-sync": { expireStorefrontProductCache: async () => ++requests === 3 && succeeds },
  })
  await subscriber.default({ event: { name: "inventory.inventory-level.updated" } })
  assert.equal(requests, 3)
  requests = 0
  succeeds = false
  await assert.rejects(subscriber.default({ event: { name: "product.updated" } }), /expiry failed/)
  assert.equal(requests, 3)
})

test("product invalidation hard-expires data and the real internal product route", async (t) => {
  environment(t)
  const tags = []
  const paths = []
  const route = load("../../storefront/src/app/api/revalidate/route.ts", {
    "next/cache": {
      revalidateTag: (tag, profile) => tags.push([tag, profile]),
      revalidatePath: (value, type) => paths.push([value, type]),
    },
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
  })
  t.mock.method(global, "fetch", async (url, init) => {
    assert.equal(url, "https://storefront.test/api/revalidate")
    assert.ok(init.signal instanceof AbortSignal)
    const request = new Request(url, init)
    request.nextUrl = new URL(url)
    return route.POST(request)
  })
  const lib = load("../src/lib/product-search-sync.ts")
  assert.equal(await lib.expireStorefrontProductCache(), true)
  assert.deepEqual(tags, ["products", "categories", "collections"].map(tag => [tag, { expire: 0 }]))
  assert.ok(paths.some(([value, type]) => value === "/[countryCode]/products/[handle]" && type === "page"))
})

test("homepage refresh confirms the response and rejects auth failures or HTML redirects", async (t) => {
  environment(t)
  const lib = load("../src/lib/storefront-cache.ts")
  let response = Response.json({ revalidated: true })
  t.mock.method(global, "fetch", async (url, init) => {
    assert.equal(url, "https://storefront.test/api/revalidate")
    assert.equal(init.headers["x-revalidate-secret"], "test-secret")
    assert.deepEqual(JSON.parse(init.body).tags, ["homepage"])
    return response
  })
  assert.equal(await lib.expireStorefrontHomepageCache(), true)
  response = Response.json({ message: "Invalid secret" }, { status: 401 })
  assert.equal(await lib.expireStorefrontHomepageCache(), false)
  response = new Response("<html>Wrong destination</html>")
  assert.equal(await lib.expireStorefrontHomepageCache(), false)
})

test("cache expiry completes even when Meilisearch rejects re-indexing", async (t) => {
  environment(t)
  const calls = []
  t.mock.method(global, "fetch", async (url) => {
    calls.push(url)
    return url.includes("/api/revalidate")
      ? Response.json({ revalidated: true })
      : new Response("Unavailable", { status: 503 })
  })
  const container = { resolve: () => ({ graph: async () => ({ data: [{ id: "prod_test", title: "Changed title" }] }) }) }
  const lib = load("../src/lib/product-search-sync.ts")
  await assert.rejects(lib.syncProductSearchAndCache(container, "prod_test"), /Meili product upsert failed/)
  assert.equal(calls[0], "https://storefront.test/api/revalidate")
  assert.ok(calls[1].startsWith("https://search.test/"))
})

test("deleting a variant still resolves its parent for re-indexing remaining SKUs", async () => {
  const resolver = load("../src/lib/product-event-target.ts")
  const container = { resolve: () => ({ listProductVariants: async (filters, config) => {
    assert.deepEqual(filters, { id: "variant_deleted" })
    assert.equal(config.withDeleted, true)
    return [{ id: "variant_deleted", product_id: "prod_parent" }]
  } }) }
  assert.equal(await resolver.resolveProductIdFromEvent(container, { id: "variant_deleted" }, "variant"), "prod_parent")
})

test("deleted product returns the actual failed cache-expiry status", async (t) => {
  environment(t)
  t.mock.method(global, "fetch", async (url) => url.includes("/api/revalidate")
    ? new Response("Unavailable", { status: 503 })
    : Response.json({ taskUid: 1 }))
  const lib = load("../src/lib/product-search-sync.ts")
  const container = { resolve: () => ({ graph: async () => ({ data: [] }) }) }
  assert.deepEqual(await lib.syncProductSearchAndCache(container, "prod_deleted"), {
    indexed: false, deleted: true, cacheExpired: false,
  })
})
