const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

function loadRelatedProducts(catalog) {
  const requests = []
  const source = fs.readFileSync(
    path.join(
      __dirname,
      "../src/modules/products/components/related-products/data.ts"
    ),
    "utf8"
  )
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
  const mod = { exports: {} }
  const mocks = {
    "./constants": {
      RELATED_PRODUCTS_PAGE_SIZE: 6,
      RELATED_PRODUCTS_FIELDS:
        "id,title,handle,thumbnail,*images,*variants.calculated_price,+variants.inventory_quantity",
    },
    "@lib/config": {
      sdk: {
        store: {
          product: {
            list: async (query, options) => {
              requests.push({ query, options })
              const filtered = catalog.filter(
                (product) =>
                  (!query.collection_id ||
                    query.collection_id.includes(product.collection_id)) &&
                  (!query.tags || query.tags.includes(product.tag))
              )
              return {
                products: filtered.slice(
                  query.offset,
                  query.offset + query.limit
                ),
                count: filtered.length,
              }
            },
          },
        },
      },
    },
    "@lib/data/regions": {
      getRegion: async (countryCode) => ({
        id: `reg_${countryCode}`,
      }),
    },
  }

  new Function("require", "module", "exports", code)(
    (id) => {
      if (!(id in mocks)) throw new Error(`Unexpected import: ${id}`)
      return mocks[id]
    },
    mod,
    mod.exports
  )

  return { ...mod.exports, requests }
}

const catalog = Array.from({ length: 9 }, (_, index) => ({
  id: `prod_${index}`,
  collection_id: "col_test",
  tag: "flo",
}))

test("related batches request prices and inventory and filter the current product", async () => {
  const { getRelatedProductsPage, requests } = loadRelatedProducts(catalog)
  const result = await getRelatedProductsPage({
    countryCode: "al",
    productId: "prod_0",
    collectionId: "col_test",
    tags: ["flo"],
    offset: 0,
    limit: 2,
  })

  assert.deepEqual(result.products.map((product) => product.id), ["prod_1"])
  assert.equal(result.count, 9)
  assert.equal(result.nextOffset, 2)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].query.limit, 2)
  assert.equal(requests[0].query.offset, 0)
  assert.equal(requests[0].query.region_id, "reg_al")
  assert.equal(requests[0].query.fields, "id,title,handle,thumbnail,*images,*variants.calculated_price,+variants.inventory_quantity")
  assert.deepEqual(requests[0].options, {
    cache: "force-cache",
    next: { tags: ["products", "related-products"], revalidate: 60 },
  })
})

test("the returned offset continues after the smaller initial batch", async () => {
  const { getRelatedProductsPage } = loadRelatedProducts(catalog)
  const initial = await getRelatedProductsPage({
    countryCode: "al",
    productId: "prod_0",
    offset: 0,
    limit: 2,
  })
  const next = await getRelatedProductsPage({
    countryCode: "al",
    productId: "prod_0",
    offset: initial.nextOffset,
    limit: 6,
  })

  assert.deepEqual(next.products.map((product) => product.id), [
    "prod_2",
    "prod_3",
    "prod_4",
    "prod_5",
    "prod_6",
    "prod_7",
  ])
  assert.equal(next.nextOffset, 8)
})

test("demand pagination clamps a caller supplied limit to six", async () => {
  const { getRelatedProductsPage, requests } = loadRelatedProducts(catalog)
  await getRelatedProductsPage({
    countryCode: "al",
    productId: "prod_0",
    limit: 100,
  })

  assert.equal(requests[0].query.limit, 6)
})
