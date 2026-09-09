const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

function loadProducts(catalog) {
  const requests = []
  const source = fs.readFileSync(path.join(__dirname, "../src/lib/data/products.ts"), "utf8")
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
  const mod = { exports: {} }
  const mocks = {
    react: { cache: (fn) => fn },
    "./regions": { getRegion: async () => ({ id: "reg_test" }) },
    "@lib/util/sort-products": { sortProducts: (products) => products },
    "@lib/config": {
      sdk: { store: { product: { list: async (query) => {
        requests.push(query)
        const filtered = catalog.filter((product) =>
          (!query.category_id || query.category_id.includes(product.category)) &&
          (!query.collection_id || query.collection_id.includes(product.collection)) &&
          (!query.id || query.id.includes(product.id))
        )
        return {
          products: filtered.slice(query.offset, query.offset + query.limit),
          count: filtered.length,
        }
      } } } },
    },
  }
  new Function("require", "module", "exports", code)((id) => {
    if (!(id in mocks)) throw new Error(`Unexpected import: ${id}`)
    return mocks[id]
  }, mod, mod.exports)
  return { ...mod.exports, requests }
}

const catalog = Array.from({ length: 307 }, (_, i) => ({
  id: `prod_${i}`,
  category: i < 25 ? "cat_filtered" : "cat_other",
  collection: "col_test",
}))

test("all 26 advertised pages are reachable with at most 12 products per request", async () => {
  const { getProductsListWithSort, requests } = loadProducts(catalog)
  const ids = []
  for (let page = 1; page <= 26; page++) {
    const result = await getProductsListWithSort({ page, countryCode: "al" })
    assert.equal(result.response.count, 307)
    assert.equal(result.response.products.length, page === 26 ? 7 : 12)
    assert.equal(result.nextPage, page === 26 ? null : page + 1)
    ids.push(...result.response.products.map((product) => product.id))
  }
  assert.deepEqual(ids, catalog.map((product) => product.id))
  assert.equal(requests.length, 26)
  requests.forEach((query, i) => {
    assert.equal(query.limit, 12)
    assert.equal(query.offset, i * 12)
    assert.equal(query.order, "-created_at,id")
    assert.equal(query.region_id, "reg_test")
  })
})

test("filtered count and page results use the same filters", async () => {
  const { getProductsListWithSort, requests } = loadProducts(catalog)
  const result = await getProductsListWithSort({
    page: 3,
    countryCode: "al",
    queryParams: { limit: 12, category_id: ["cat_filtered"], collection_id: ["col_test"] },
  })
  assert.equal(result.response.count, 25)
  assert.deepEqual(result.response.products.map((product) => product.id), ["prod_24"])
  assert.equal(result.nextPage, null)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].offset, 24)
})

test("invalid pages normalize to the first page and nextPage stays a page number", async () => {
  for (const page of [0, -1, NaN, Infinity]) {
    const { getProductsListWithSort, requests } = loadProducts(catalog)
    const result = await getProductsListWithSort({ page, countryCode: "al" })
    assert.equal(requests[0].offset, 0)
    assert.equal(result.nextPage, 2)
  }
})
