const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const path = require('node:path')

function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)((id) => {
    if (!(id in mocks)) throw new Error(`Unexpected dependency: ${id}`)
    return mocks[id]
  }, mod, mod.exports)
  return mod.exports
}
const { createCartResource } = load('lib/util/cart-resource.ts')

test('restoring a cart never opens the drawer; a successful add does', async () => {
  let cart = { id: 'cart_a', items: [1] }
  const resource = createCartResource(async () => cart)
  assert.equal(resource.getServerSnapshot().cart, null)
  await resource.refresh()
  assert.equal(resource.getSnapshot().loaded, true)
  assert.equal(resource.getSnapshot().openVersion, 0)
  cart = { ...cart, items: [1, 2] }
  await resource.refresh(true)
  assert.equal(resource.getSnapshot().openVersion, 1)
  assert.equal(resource.getSnapshot().cart, cart)
  await resource.refresh()
  assert.equal(resource.getSnapshot().openVersion, 1)
  assert.equal(resource.getServerSnapshot().cart, null)
})

test('an old in-flight cart cannot overwrite a newer mutation response', async () => {
  const pending = []
  const resource = createCartResource(() => new Promise(resolve => pending.push(resolve)))
  const old = resource.refresh()
  const added = resource.refresh(true)
  const focused = resource.refresh()
  pending[2]({ id: 'new' })
  await focused
  pending[1]({ id: 'middle' })
  pending[0]({ id: 'old' })
  await Promise.all([old, added])
  assert.equal(resource.getSnapshot().cart.id, 'new')
  assert.equal(resource.getSnapshot().openVersion, 1)
})

test('failed refresh preserves known cart and can recover', async () => {
  let fail = false
  const resource = createCartResource(async () => { if (fail) throw Error('offline'); return { id: 'cart_a' } })
  let updates = 0
  const unsubscribe = resource.subscribe(() => updates++)
  await resource.refresh()
  fail = true
  await resource.refresh()
  assert.equal(resource.getSnapshot().cart.id, 'cart_a')
  assert.equal(resource.getSnapshot().error, true)
  fail = false
  await resource.refresh()
  assert.equal(resource.getSnapshot().error, false)
  assert.equal(updates, 3)
  unsubscribe()
  await resource.refresh()
  assert.equal(updates, 3)
})

test('a failed add refresh does not open the drawer on a later ordinary refresh', async () => {
  let fail = true
  const resource = createCartResource(async () => {
    if (fail) throw Error('offline')
    return { id: 'cart_a' }
  })
  await resource.refresh(true)
  assert.equal(resource.getSnapshot().error, true)
  fail = false
  await resource.refresh()
  assert.equal(resource.getSnapshot().openVersion, 0)
  assert.equal(resource.getSnapshot().cart.id, 'cart_a')
})

test('client mutations refresh only after success, and only adds request auto-open', async () => {
  const calls = []
  let fail = false
  const actions = Object.fromEntries(['addToCart', 'updateLineItem', 'deleteLineItem'].map(name => [name, async (...args) => {
    calls.push([name, ...args]); if (fail) throw Error('mutation failed'); return name
  }]))
  const client = load('lib/data/cart-client.ts', {
    './cart': actions,
    './header-cart': { retrieveHeaderCart() {} },
    '@lib/util/cart-resource': { createCartResource: () => ({ refresh: (open = false) => { calls.push(['refresh', open]) } }) },
  })
  assert.equal(await client.addToCart({ quantity: 2 }), 'addToCart')
  assert.deepEqual(calls.splice(0), [['addToCart', { quantity: 2 }], ['refresh', true]])
  await client.updateLineItem({ quantity: 3 })
  await client.deleteLineItem('line_1')
  assert.deepEqual(calls.splice(0), [['updateLineItem', { quantity: 3 }], ['refresh', false], ['deleteLineItem', 'line_1'], ['refresh', false]])
  fail = true
  await assert.rejects(client.addToCart({ quantity: 1 }), /mutation failed/)
  assert.deepEqual(calls, [['addToCart', { quantity: 1 }]])
})
