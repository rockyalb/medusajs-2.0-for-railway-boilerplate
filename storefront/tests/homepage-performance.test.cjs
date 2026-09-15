const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const storefrontRoot = path.join(__dirname, "..")

const read = (relativePath) =>
  fs.readFileSync(path.join(storefrontRoot, relativePath), "utf8")

test("PostHog stays out of the synchronous instrumentation bootstrap", () => {
  const instrumentation = read("instrumentation-client.ts")
  const posthog = read("src/lib/posthog.ts")

  assert.match(instrumentation, /schedulePostHogLoad\(\)/)
  assert.doesNotMatch(instrumentation, /from ["']posthog-js/)
  assert.match(posthog, /import\(["']posthog-js\/no-external["']\)/)

  for (const option of [
    "autocapture: false",
    "capture_dead_clicks: false",
    "capture_exceptions: false",
    "capture_performance: false",
    "disable_session_recording: true",
    "disable_surveys: true",
    "disable_external_dependency_loading: true",
  ]) {
    assert.match(posthog, new RegExp(option))
  }
})

test("the homepage only preloads its LCP image", () => {
  const productRail = read(
    "src/modules/home/components/featured-products/product-rail/index.tsx"
  )

  assert.doesNotMatch(productRail, /priority=\{productIndex/)
})

test("the homepage render path does not import Motion", () => {
  const homepageFiles = [
    "src/app/[countryCode]/(main)/page.tsx",
    "src/modules/home/components/category-grid/index.tsx",
    "src/modules/home/components/editorial-tiles/index.tsx",
    "src/modules/home/components/featured-brands/index.tsx",
    "src/modules/home/components/hero/hero-copy.tsx",
    "src/modules/home/components/newsletter/index.tsx",
    "src/modules/home/components/offers/index.tsx",
    "src/modules/home/components/product-of-the-month/banner.tsx",
    "src/modules/home/components/testimonials/index.tsx",
    "src/modules/home/components/trust-badges/index.tsx",
  ]

  for (const file of homepageFiles) {
    assert.doesNotMatch(read(file), /motion\/react|components\/motion/, file)
  }
})
