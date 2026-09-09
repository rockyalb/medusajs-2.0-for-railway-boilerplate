const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, "../src", file), "utf8")
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const mod = { exports: {} }
  new Function("require", "module", "exports", code)(
    (id) => {
      if (!(id in mocks)) throw new Error(`Unexpected dependency: ${id}`)
      return mocks[id]
    },
    mod,
    mod.exports
  )
  return mod.exports
}

class MockHeaders {
  constructor() {
    this.values = new Map()
  }

  set(name, value) {
    this.values.set(name.toLowerCase(), value)
  }

  get(name) {
    return this.values.get(name.toLowerCase()) ?? null
  }
}

class MockResponse {
  constructor(kind, url, status = 200) {
    this.kind = kind
    this.url = url
    this.status = status
    this.headers = new MockHeaders()
    this.setCookies = []
    this.cookies = {
      set: (...args) => this.setCookies.push(args),
    }
  }

  static redirect(url, status) {
    return new MockResponse("redirect", url.toString(), status)
  }

  static rewrite(url) {
    return new MockResponse("rewrite", url.toString())
  }
}

const { proxy } = load("proxy.ts", {
  "next/server": { NextResponse: MockResponse },
})

function makeRequest(pathname, { cookies = {}, headers = {} } = {}) {
  const nextUrl = new URL(`https://example.test${pathname}`)
  nextUrl.clone = () => new URL(nextUrl.toString())

  return {
    nextUrl,
    cookies: {
      get(name) {
        const value = cookies[name]
        return value === undefined ? undefined : { value }
      },
    },
    headers: new Headers(headers),
  }
}

test("public URLs always rewrite to Albania despite country cookies or geo headers", () => {
  for (const cookies of [{}, { _medusa_cart_id: "cart_existing" }]) {
    const response = proxy(
      makeRequest("/products/widget?sort=popular", {
        cookies: { ...cookies, _medusa_country_code: "de" },
        headers: { "x-vercel-ip-country": "DE" },
      })
    )

    assert.equal(response.kind, "rewrite")
    assert.equal(new URL(response.url).pathname, "/al/products/widget")
    assert.equal(new URL(response.url).search, "?sort=popular")
    assert.equal(response.headers.get("Vary"), null)
    assert.equal(response.headers.get("Cache-Control"), null)
    assert.deepEqual(response.setCookies, [])
  }
})

test("an internal Albania prefix redirects to the clean public URL", () => {
  const response = proxy(makeRequest("/al/products/widget?sort=popular"))

  assert.equal(response.kind, "redirect")
  assert.equal(response.status, 308)
  const location = new URL(response.url)
  assert.equal(location.pathname, "/products/widget")
  assert.equal(location.search, "?sort=popular")
  assert.deepEqual(response.setCookies, [])
})

test("cart handoff redirects privately and creates the cart cookie", () => {
  const response = proxy(makeRequest("/checkout?cart_id=cart_new"))

  assert.equal(response.kind, "redirect")
  assert.equal(response.status, 307)
  const location = new URL(response.url)
  assert.equal(location.pathname, "/checkout")
  assert.equal(location.search, "?cart_id=cart_new&step=address")
  assert.equal(response.headers.get("Cache-Control"), "private, no-store")
  assert.deepEqual(response.setCookies, [
    [
      "_medusa_cart_id",
      "cart_new",
      {
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      },
    ],
  ])
})
