const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)((id) => mocks[id] ?? require(id), mod, mod.exports)
  return mod.exports
}
const policy = load('lib/store-credit-policy.ts')
const { validateStoreCreditPolicy } = load('workflows/steps/validate-store-credit-policy.ts', {
  '../../lib/store-credit-policy': policy,
  '@medusajs/framework/workflows-sdk': { createStep: () => null },
  '@medusajs/framework/utils': { MedusaError: class extends Error {
    static Types = { INVALID_DATA: 'invalid', NOT_ALLOWED: 'denied' }
    constructor(type, message) { super(message); this.type = type }
  } },
})
function container({ balance = 1000, itemTotal = 2400, lines = [], customer = 'customer', currency = 'all' } = {}) {
  return { resolve: () => ({ graph: async ({ entity }) => ({ data: [entity === 'cart'
    ? { customer_id: customer, currency_code: currency, item_total: itemTotal, total: itemTotal + 500, credit_lines: lines }
    : { id: 'account', balance }] }) }) }
}
test('500 ALL unlocks redemption, below it does not', () => {
  assert.equal(policy.maximumStoreCredit(499.99, 4000, 'all'), 0)
  assert.equal(policy.maximumStoreCredit(500, 4000, 'all'), 500)
  assert.equal(policy.maximumStoreCredit(500, 1000, 'all'), 250)
})
test('cap rounds down, respects balance, and rejects invalid amounts/currency', () => {
  assert.equal(policy.maximumStoreCredit(2000, 1000.03, 'ALL'), 250)
  assert.equal(policy.maximumStoreCredit(600, 10000, 'all'), 600)
  for (const amount of [NaN, Infinity, -1, 0]) assert.equal(policy.maximumStoreCredit(1000, amount, 'all'), 0)
  assert.equal(policy.maximumStoreCredit(1000, 4000, 'eur'), 0)
})
test('application uses VAT-inclusive product total and excludes shipping', async () => {
  assert.equal(await validateStoreCreditPolicy({ cart_id: 'cart', customer_id: 'customer' }, container()), 600)
  await assert.rejects(validateStoreCreditPolicy({ cart_id: 'cart', customer_id: 'customer', amount: 601 }, container()))
})
test('rejects unauthorized carts, insufficient balance, zero and nonfinite requests', async () => {
  await assert.rejects(validateStoreCreditPolicy({ cart_id: 'cart', customer_id: 'other' }, container()))
  await assert.rejects(validateStoreCreditPolicy({ cart_id: 'cart', customer_id: 'customer' }, container({ balance: 499 })))
  for (const amount of [0, -1, NaN, Infinity]) await assert.rejects(validateStoreCreditPolicy({ cart_id: 'cart', customer_id: 'customer', amount }, container()))
})
test('completion rechecks changed totals and combined credit lines', async () => {
  const lines = [{ reference: 'store-credit', reference_id: 'account', amount: 300 }, { reference: 'store-credit', reference_id: 'account', amount: 300 }]
  assert.equal(await validateStoreCreditPolicy({ cart_id: 'cart', completing: true }, container({ lines })), 600)
  await assert.rejects(validateStoreCreditPolicy({ cart_id: 'cart', completing: true }, container({ lines, itemTotal: 2000 })))
  await assert.rejects(validateStoreCreditPolicy({ cart_id: 'cart', completing: true }, container({ lines, balance: 499 })))
  await assert.rejects(validateStoreCreditPolicy({ cart_id: 'cart', completing: true }, container({ lines: [{ ...lines[0], reference_id: 'other' }] })))
})
test('guest orders and gift-card-only orders remain eligible', async () => {
  assert.equal(await validateStoreCreditPolicy({ cart_id: 'cart', completing: true }, container({ customer: null })), 0)
  assert.equal(await validateStoreCreditPolicy({ cart_id: 'cart', completing: true }, container({ lines: [{ reference: 'gift-card', amount: 2000 }] })), 0)
})
