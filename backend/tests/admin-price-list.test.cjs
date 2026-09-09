const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { getReferencePrice, addReferencePriceColumns } = require("../src/admin-customizations/price-list-reference.cjs")
const { patchDashboard, replaceOnce } = require("../src/scripts/patch-admin-dashboard.cjs")

const price = (amount, extra = {}) => ({ amount, currency_code: "all", rules: {}, ...extra })

test("references use the matching region, then currency, without mixing offers or quantity tiers", () => {
  const prices = [
    price(4000), price(3500, { rules: { region_id: "albania" } }),
    price(2000, { min_quantity: 10 }), price(1000, { price_list_id: "sale" }),
    price(30, { currency_code: "eur" }),
    price(1500, { rules: { customer_group_id: "vip" } }),
    price(1800, { rules: { region_id: "albania", customer_group_id: "vip" } }),
  ]
  assert.equal(getReferencePrice(prices, "ALL"), 4000)
  assert.equal(getReferencePrice(prices, "all", "albania"), 3500)
  assert.equal(getReferencePrice(prices, "all", "another-region"), 4000)
  assert.equal(getReferencePrice(prices, "usd"), null)
})

test("zero is a price; missing, invalid, and unavailable single-unit prices are not", () => {
  assert.equal(getReferencePrice([price(0)], "all"), 0)
  assert.equal(getReferencePrice(undefined, "all"), null)
  assert.equal(getReferencePrice([price(NaN), price(Infinity), price(5, { max_quantity: 0 })], "all"), null)
})

test("reference columns sit beside original inputs without writable fields or changed input definitions", () => {
  const title = { id: "Title" }
  const currency = { id: "currency_prices.all", meta: { field: "original-field" } }
  const region = { id: "region_prices.albania" }
  const dependencies = {
    regions: [{ id: "albania", name: "Albania", currency_code: "all" }],
    columnHelper: { column: (definition) => definition },
    DataGrid: { ReadonlyCell: "readonly" },
    jsx: (type, props) => ({ type, props }),
    t: (_, values) => values.defaultValue.replace("{{scope}}", values.scope),
  }
  const columns = addReferencePriceColumns([title, currency, region], dependencies)
  assert.deepEqual(columns.map((column) => column.id), [
    "Title", "reference.currency_prices.all", "currency_prices.all",
    "reference.region_prices.albania", "region_prices.albania",
  ])
  assert.equal(columns[2], currency)
  assert.equal(columns[4], region)
  assert.equal(columns[1].field, undefined)
  const context = { row: { original: { product_id: "prod", prices: [price(4000)] } } }
  assert.equal(columns[1].cell(context).type, "readonly")
  assert.match(columns[1].cell(context).props.children.props.children, /4[,.\s]?000/)
  assert.equal(columns[1].cell({ row: { original: { product_id: "prod" } } }).props.children.props.children, "Not set")
  assert.equal(columns[1].cell({ row: { original: { variants: [] } } }).props.children, undefined)
})

test("patch signatures fail on missing or ambiguous matches", () => {
  assert.throws(() => replaceOnce("abc", "missing", "x"), /signature changed/)
  assert.throws(() => replaceOnce("abc abc", "abc", "x"), /signature changed/)
})

test("installed dashboard patch is valid JavaScript, covers all three price screens, and is idempotent", () => {
  const root = path.dirname(require.resolve("@medusajs/dashboard/package.json"))
  patchDashboard(root)
  assert.equal(patchDashboard(root), 0)
  const dist = path.join(root, "dist")
  const patched = fs.readdirSync(dist).filter((file) => file.endsWith(".mjs"))
    .map((file) => fs.readFileSync(path.join(dist, file), "utf8"))
    .filter((source) => source.includes("// yco-price-list-admin-v1"))
  assert.equal(patched.length, 5)
  const esbuild = require("esbuild")
  for (const source of patched) esbuild.transformSync(source, { loader: "js" })
  assert.equal(patched.filter((source) => source.includes("*variants.prices,variants.prices.price_rules.attribute")).length, 3)
  const filters = patched.find((source) => source.includes("var useProductTableFilters ="))
  assert.match(filters, /key: "collection_id"/)
  assert.match(filters, /multiple: true, searchable: true/)
})

test("an unreviewed dashboard version fails before mutation", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "admin-patch-test-"))
  try {
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ version: "2.16.0" }))
    assert.throws(() => patchDashboard(root), /require review/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
