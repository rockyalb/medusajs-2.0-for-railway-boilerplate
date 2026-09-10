const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

function load(relative, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", relative), "utf8")
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const module = { exports: {} }
  new Function("require", "module", "exports", code)((name) => {
    if (name in dependencies) return dependencies[name]
    throw new Error(`Unexpected dependency: ${name}`)
  }, module, module.exports)
  return module.exports
}
const discountUtils = load("src/lib/util/discounts.ts")
const variant = (amount, original = amount, type = "sale") => ({
  id: `variant_${amount}`, calculated_price: { calculated_amount: amount, original_amount: original, currency_code: "all", calculated_price: { price_list_type: type } },
})

test("only genuine calculated sales qualify, including free items", () => {
  assert.equal(discountUtils.isDiscountedVariant(variant(1800, 2000)), true)
  assert.equal(discountUtils.isDiscountedVariant(variant(0, 2000)), true)
  for (const v of [variant(2000), variant(2200, 2000), variant(1800, 2000, "override"), variant(10, null), variant(0, 0), {}]) {
    assert.equal(discountUtils.isDiscountedVariant(v), false)
  }
  const product = { variants: [variant(100), variant(1800, 2000), variant(1500, 2000)] }
  assert.equal(discountUtils.getDiscountedVariant(product).id, "variant_1500")
})

function fixture() {
  const calls = []
  const products = Array.from({ length: 207 }, (_, i) => ({ id: `p${i}`, variants: [variant(i + 1, i >= 180 ? 300 : i + 1)] }))
  const sdk = { store: { product: { list: async (query) => {
    calls.push(query)
    assert.equal(query.region_id, "al-region")
    return query.id ? { products: products.filter(p => query.id.includes(p.id)).reverse() } : {
      products: products.slice(query.offset, query.offset + query.limit), count: products.length,
    }
  } } } }
  const data = load("src/lib/data/discounts.ts", {
    "server-only": {}, "@lib/config": { sdk }, "@lib/data/regions": { getRegion: async () => ({ id: "al-region" }) },
    "@lib/util/discounts": discountUtils, "react": { cache: fn => fn },
    "next/cache": { unstable_cache: fn => fn },
  })
  return { ...data, calls }
}

test("discounts after catalog page 2 are counted and paginated before hydration", async () => {
  const f = fixture()
  const result = await f.getDiscountedProducts({ countryCode: "al", page: 2, sortBy: "created_at" })
  assert.equal(result.count, 27)
  assert.equal(result.products.length, 12)
  assert.equal(result.products[0].id, "p192")
  assert.equal(result.products.at(-1).id, "p203")
  assert.deepEqual(f.calls.filter(c => !c.id).map(c => c.offset), [0, 100, 200])
  assert.equal(f.calls.at(-1).id.length, 12)
})

test("price sort covers the entire sale set and invalid/out-of-range pages are bounded", async () => {
  const f = fixture()
  const descending = await f.getDiscountedProducts({ countryCode: "al", page: NaN, sortBy: "price_desc" })
  assert.equal(descending.page, 1)
  assert.equal(descending.products[0].id, "p206")
  const last = await f.getDiscountedProducts({ countryCode: "al", page: 999, sortBy: "price_asc" })
  assert.equal(last.page, 3)
  assert.deepEqual(last.products.map(p => p.id), ["p204", "p205", "p206"])
})

test("Meta price fields preserve ALL and match storefront discount semantics", () => {
  const { getCatalogPrice } = load("../backend/src/lib/meta-catalog-price.ts")
  assert.deepEqual(getCatalogPrice(variant(1800, 2000).calculated_price), { price: "2000.00 ALL", salePrice: "1800.00 ALL" })
  assert.deepEqual(getCatalogPrice(variant(1800, 2000, "override").calculated_price), { price: "1800.00 ALL", salePrice: null })
  assert.deepEqual(getCatalogPrice(variant(0, 2000).calculated_price), { price: "2000.00 ALL", salePrice: "0.00 ALL" })
  assert.equal(getCatalogPrice(), null)
  assert.equal(getCatalogPrice({ calculated_amount: Infinity, currency_code: "all" }), null)
})

test("Meta XML uses regional calculated prices, sale labels and keeps existing variant IDs", async () => {
  const { getCatalogPrice } = load("../backend/src/lib/meta-catalog-price.ts")
  const context = []
  const { GET } = load("../backend/src/api/meta/catalog/route.ts", {
    "@medusajs/framework/utils": { QueryContext: value => value, MedusaError: class extends Error {} },
    "../../../lib/meta-catalog-price": { getCatalogPrice },
  })
  let xml
  await GET({ scope: { resolve: () => ({ graph: async (query) => {
    if (query.entity === "region") return { data: [{ id: "al-region", currency_code: "all", countries: [{ iso_2: "al" }] }] }
    context.push(query.context)
    return { data: [{ id: "p1", title: "Serum & cream", handle: "serum", thumbnail: "https://example.com/image.png", variants: [variant(1800, 2000), variant(100)], metadata: { meta_custom_label_0: "test" } }], metadata: { count: 1 } }
  } }) } }, { setHeader() {}, status() { return this }, send(value) { xml = value } })
  assert.deepEqual(context[0].variants.calculated_price, { region_id: "al-region", currency_code: "all" })
  assert.match(xml, /<g:price>2000.00 ALL<\/g:price><g:sale_price>1800.00 ALL<\/g:sale_price>/)
  assert.equal((xml.match(/<g:sale_price>/g) || []).length, 1)
  assert.match(xml, /<g:custom_label_4>on_sale<\/g:custom_label_4>/)
  assert.match(xml, /<g:custom_label_4>regular_price<\/g:custom_label_4>/)
  assert.match(xml, /<g:id>variant_1800<\/g:id>/)
  assert.match(xml, /Serum &amp; cream/)
})
