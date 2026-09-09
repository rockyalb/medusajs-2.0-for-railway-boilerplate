// The dashboard ships compiled ESM chunks. Widgets cannot extend these grids.
// Keep this patch narrow, guarded, and independent of npm/pnpm installation hooks.
const fs = require("node:fs")
const path = require("node:path")
const { getReferencePrice, addReferencePriceColumns } = require("../admin-customizations/price-list-reference.cjs")

const MARKER = "// yco-price-list-admin-v1"

function replaceOnce(source, before, after) {
  if (source.split(before).length !== 2) {
    throw new Error(`Dashboard patch signature changed: ${before.slice(0, 100)}. Review the Medusa dashboard upgrade.`)
  }
  return source.replace(before, after)
}

function patchDashboard(dashboardRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(dashboardRoot, "package.json"), "utf8"))
  if (pkg.version !== "2.15.3") {
    throw new Error(`Admin customizations require review for dashboard ${pkg.version}; expected 2.15.3.`)
  }
  const dist = path.join(dashboardRoot, "dist")
  const files = fs.readdirSync(dist).filter((file) => file.endsWith(".mjs"))
  const chunks = files.map((file) => ({ file, source: fs.readFileSync(path.join(dist, file), "utf8") }))
  const find = (signature) => {
    const matches = chunks.filter(({ source }) => source.includes(signature))
    if (matches.length !== 1) throw new Error(`Expected one dashboard chunk for ${signature}; found ${matches.length}`)
    return matches[0]
  }
  const collections = find("var useCollections =")
  const filters = find("var useProductTableFilters =")
  const grid = find("var usePriceListGridColumns =")
  const screens = [
    "// src/routes/price-lists/price-list-create/components/price-list-create-form/price-list-prices-form.tsx",
    "// src/routes/price-lists/price-list-prices-add/components/price-list-prices-add-form/price-list-prices-add-prices-form.tsx",
    "// src/routes/price-lists/price-list-prices-edit/price-list-prices-edit.tsx",
  ].map(find)
  const changes = []
  if (!filters.source.includes(MARKER)) {
    let source = `import { useCollections } from "./${collections.file}";\n` + filters.source
    source = replaceOnce(source, "  let filters = [];", `  const isCollectionExcluded = exclude?.includes("collections");
  const { collections, isError: isCollectionsError, error: collectionsError } = useCollections(
    { limit: 1000, fields: "id,title", order: "title" },
    { enabled: !isCollectionExcluded }
  );
  if (isCollectionsError && !isCollectionExcluded) throw collectionsError;
  let filters = [];
  if (collections && !isCollectionExcluded) {
    filters.push({
      key: "collection_id", label: t("fields.collection"), type: "select",
      multiple: true, searchable: true,
      options: collections.map((collection) => ({ label: collection.title, value: collection.id }))
    });
  }`)
    changes.push({ file: filters.file, source: `${MARKER}\n${source}` })
  }
  if (!grid.source.includes(MARKER)) {
    const source = replaceOnce(grid.source, "  return colDefs;", `  return addReferencePriceColumns(colDefs, { regions, columnHelper, DataGrid, jsx, t });`)
    changes.push({ file: grid.file, source: `${MARKER}\n${getReferencePrice.toString()}\n${addReferencePriceColumns.toString()}\n${source}` })
  }
  const oldFields = '"title,thumbnail,*variants,-type,-collection,-options,-tags,-images,-sales_channels"'
  const newFields = '"title,thumbnail,*variants,*variants.prices,variants.prices.price_rules.attribute,variants.prices.price_rules.value,-type,-collection,-options,-tags,-images,-sales_channels"'
  for (const screen of screens) {
    if (!screen.source.includes(MARKER)) {
      changes.push({ file: screen.file, source: `${MARKER}\n${replaceOnce(screen.source, oldFields, newFields)}` })
    }
  }
  // Validate every signature before changing any file. Copy-on-write avoids pnpm hardlink mutation.
  for (const { file, source } of changes) {
    const target = path.join(dist, file)
    fs.writeFileSync(`${target}.yco-tmp`, source)
    fs.renameSync(`${target}.yco-tmp`, target)
  }
  return changes.length
}

if (require.main === module) {
  const root = path.dirname(require.resolve("@medusajs/dashboard/package.json"))
  console.log(`Admin price-list customizations: ${patchDashboard(root)} dashboard files updated.`)
}

module.exports = { patchDashboard, replaceOnce }
