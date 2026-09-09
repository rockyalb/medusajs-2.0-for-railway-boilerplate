# Price-list editor customizations

`npm run dev` / `pnpm dev` and the build command apply the version-checked
`src/scripts/patch-admin-dashboard.cjs` patch to Medusa Dashboard 2.15.3.
Use these commands instead of invoking `medusa develop` / `medusa build` directly.

The compiled ESM dashboard is the browser entry point. The patch locates chunks
by their function/source signatures rather than hashed filenames. It validates
all replacements before writing, uses copy-on-write for pnpm compatibility, and
is idempotent. No runtime DOM manipulation or custom pricing mutations are used.

Changes:

- Shared product selectors expose the searchable, multi-select Collection filter.
  The existing query hook already sends `collection_id` to the product API.
- Price-list creation, adding products, and editing prices fetch regular variant
  prices and their region rules through the existing authenticated SDK hook.
- Each editable currency/region column has a read-only Current price reference.
  References are regular, single-unit catalog prices, excluding price-list offers.
  Region-specific prices take precedence over the same-currency base price.
  Missing prices display “Not set”; zero remains a valid price.

The installed Pricing Module's `normalizePriceSetConfig` excludes price-list
prices from the Admin product price relation. Admin response mapping converts
`price_rules` to `rules`. Do not replace this with storefront calculated prices:
those can already include the sale being edited.

When upgrading Medusa, reinstall dependencies, review the relevant upstream
screens and API semantics, and update the version/signatures in the patch.
When changing patch/helper code during development, reinstall the dashboard
package first to remove the previous marked patch, then rebuild/restart Admin.

Validation: `node --test tests/admin-price-list.test.cjs` and `pnpm build`.
In Admin, create a price list, filter by Collection, select variants, and compare
the Current price columns against Products → Prices. Also check Add products
and Edit prices on an existing price list. References must never be editable.
