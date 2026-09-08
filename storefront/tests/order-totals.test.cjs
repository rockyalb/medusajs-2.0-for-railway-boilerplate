const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")

const source = fs.readFileSync(path.join(__dirname, "../src/modules/common/components/cart-totals/index.tsx"), "utf8")
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText
const mod = { exports: {} }
new Function("require", "module", "exports", code)((id) => id === "@lib/util/money"
  ? { convertToLocale: ({ amount }) => `ALL ${amount}` } : require(id), mod, mod.exports)

test("VAT-exclusive subtotal is labeled correctly and VAT is separate", () => {
  const html = renderToStaticMarkup(React.createElement(mod.exports.default, { totals: {
    currency_code: "all", subtotal: 7916.67, tax_total: 1583.33, shipping_total: 0, total: 9500,
  } }))
  assert.match(html, /Nëntotali \(pa TVSH, pa transport\)/)
  assert.match(html, /data-testid="cart-subtotal" data-value="7916.67"/)
  assert.match(html, /data-testid="cart-taxes" data-value="1583.33"/)
  assert.match(html, /data-testid="cart-total" data-value="9500"/)
  assert.doesNotMatch(html, /me TVSH|TVSH e përfshirë/)
})
test("store credit is shown once and zero shipping is formatted", () => {
  const html = renderToStaticMarkup(React.createElement(mod.exports.default, { totals: {
    currency_code: "all", subtotal: 2000, tax_total: 400, shipping_total: 0,
    credit_line_total: 600, gift_card_total: 100, total: 1800,
  } }))
  assert.match(html, /Kredit \/ kartë dhuratë/)
  assert.match(html, /data-testid="cart-gift-card-amount" data-value="600"/)
  assert.match(html, /data-testid="cart-shipping" data-value="0">ALL 0/)
  assert.match(html, /data-testid="cart-total" data-value="1800"/)
})
