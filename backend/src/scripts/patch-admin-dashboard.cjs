// The dashboard ships compiled ESM chunks. Widgets cannot extend these grids.
// Keep this patch narrow, guarded, and independent of npm/pnpm installation hooks.
const fs = require("node:fs")
const path = require("node:path")
const { getReferencePrice, addReferencePriceColumns } = require("../admin-customizations/price-list-reference.cjs")

const MARKER = "// yco-price-list-admin-v1"
const PRODUCT_CREATE_MARKER = "// yco-product-create-defaults-v1"
const PRODUCT_HANDLE_MARKER = "// yco-product-create-handle-v1"

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
  const productCreateUtils = find("var PRODUCT_CREATE_FORM_DEFAULTS =")
  const productCreate = find("var ProductCreateForm =")
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
  if (!productCreateUtils.source.includes(PRODUCT_CREATE_MARKER)) {
    let source = productCreateUtils.source
    source = replaceOnce(
      source,
      "    is_giftcard: false,",
      `    is_giftcard: false,
    additional_data: {
      yco_initial_stock: values.variants
        .filter((variant) => variant.should_create)
        .map((variant) => castNumber(variant.initial_stock ?? 0))
    },`
    )
    source = replaceOnce(
      source,
      "    manage_inventory: variant.manage_inventory || false,",
      `    manage_inventory: variant.manage_inventory ?? true,
    initial_stock: variant.initial_stock ?? "0",`
    )
    source = replaceOnce(
      source,
      "  manage_inventory: z.boolean().optional(),",
      `  manage_inventory: z.boolean().optional(),
  initial_stock: optionalInt,`
    )
    changes.push({ file: productCreateUtils.file, source: `${PRODUCT_CREATE_MARKER}\n${source}` })
  }
  let productCreateSource = productCreate.source
  if (!productCreateSource.includes(PRODUCT_CREATE_MARKER)) {
    let source = productCreateSource
    source = replaceOnce(
      source,
      `        variant_rank: newVariants.length,
        // NOTE - prepare inventory array here for now so we prevent rendering issue if we append the items later`,
      `        variant_rank: newVariants.length,
        manage_inventory: true,
        initial_stock: "0",
        // NOTE - prepare inventory array here for now so we prevent rendering issue if we append the items later`
    )
    source = replaceOnce(
      source,
      `  const shippingProfiles = useComboboxData({
    queryKey: ["shipping_profiles"],
    queryFn: (params) => sdk.admin.shippingProfile.list(params),
    getOptions: (data) => data.shipping_profiles.map((shippingProfile) => ({
      label: shippingProfile.name,
      value: shippingProfile.id
    }))
  });`,
      `  const shippingProfiles = useComboboxData({
    queryKey: ["shipping_profiles"],
    queryFn: (params) => sdk.admin.shippingProfile.list(params),
    getOptions: (data) => data.shipping_profiles.map((shippingProfile) => ({
      label: shippingProfile.name,
      value: shippingProfile.id
    })),
    pageSize: 100
  });
  useEffect2(() => {
    if (form.getValues("shipping_profile_id") || !shippingProfiles.options.length) {
      return;
    }
    const defaultProfile = shippingProfiles.options.find((profile) => profile.label.trim().toLowerCase() === "default shipping profile") ?? shippingProfiles.options.find((profile) => profile.label.trim().toLowerCase().includes("default")) ?? (shippingProfiles.options.length === 1 ? shippingProfiles.options[0] : void 0);
    if (defaultProfile) {
      form.setValue("shipping_profile_id", defaultProfile.value);
    }
  }, [form, shippingProfiles.options]);`
    )
    source = replaceOnce(
      source,
      `      columnHelper2.column({
        id: "allow_backorder",`,
      `      columnHelper2.column({
        id: "initial_stock",
        name: "Albania stock",
        header: "Albania stock",
        field: (context) => \`variants.\${context.row.original.originalIndex}.initial_stock\`,
        type: "number",
        cell: (context) => {
          return /* @__PURE__ */ jsx11(DataGrid.NumberCell, { context, placeholder: "0", min: 0, step: 1, disabled: !context.row.original.manage_inventory });
        }
      }),
      columnHelper2.column({
        id: "allow_backorder",`
    )
    source = replaceOnce(
      source,
      `  const {
    sales_channel,
    isPending: isSalesChannelPending,
    isError: isSalesChannelError,
    error: salesChannelError
  } = useSalesChannel(store?.default_sales_channel_id, {
    enabled: !!store?.default_sales_channel_id
  });`,
      `  const {
    sales_channel,
    isPending: isSalesChannelPending,
    isError: isSalesChannelError,
    error: salesChannelError
  } = useSalesChannel(store?.default_sales_channel_id, {
    enabled: !!store?.default_sales_channel_id
  });
  const {
    sales_channels: salesChannels,
    isPending: isSalesChannelsPending,
    isError: isSalesChannelsError,
    error: salesChannelsError
  } = useSalesChannels({ limit: 100 });
  const defaultChannel = sales_channel ?? salesChannels?.find((channel) => channel.name.trim().toLowerCase() === "default") ?? salesChannels?.find((channel) => channel.name.trim().toLowerCase().includes("default")) ?? salesChannels?.[0];`
    )
    source = replaceOnce(
      source,
      "  const ready = !!store && !isStorePending && !!regions && !isRegionsPending && !!sales_channel && !isSalesChannelPending && !!price_preferences && !isPricePreferencesPending;",
      "  const ready = !!store && !isStorePending && !!regions && !isRegionsPending && !!defaultChannel && !isSalesChannelsPending && (!store.default_sales_channel_id || !isSalesChannelPending) && !!price_preferences && !isPricePreferencesPending;"
    )
    source = replaceOnce(
      source,
      `  if (isPricePreferencesError) {
    throw pricePreferencesError;
  }`,
      `  if (isPricePreferencesError) {
    throw pricePreferencesError;
  }
  if (isSalesChannelsError) {
    throw salesChannelsError;
  }`
    )
    source = replaceOnce(source, "        defaultChannel: sales_channel,", "        defaultChannel,")
    productCreateSource = `${PRODUCT_CREATE_MARKER}\n${source}`
  }
  // Fill the handle from the title while it still matches the previous
  // auto-generated value, so a hand-edited handle is never overwritten.
  if (!productCreateSource.includes(PRODUCT_HANDLE_MARKER)) {
    const source = replaceOnce(
      productCreateSource,
      `var ProductCreateGeneralSection = ({
  form
}) => {
  const { t } = useTranslation();`,
      `var ProductCreateGeneralSection = ({
  form
}) => {
  const { t } = useTranslation();
  useEffect2(() => {
    const toHandle = (value) => String(value ?? "").normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    let previousTitle = form.getValues("title");
    const subscription = form.watch((values, { name }) => {
      if (name !== "title") {
        return;
      }
      const handle = values.handle ?? "";
      if (!handle || handle === toHandle(previousTitle)) {
        form.setValue("handle", toHandle(values.title), { shouldDirty: true });
      }
      previousTitle = values.title;
    });
    return () => subscription.unsubscribe();
  }, [form]);`
    )
    productCreateSource = `${PRODUCT_HANDLE_MARKER}\n${source}`
  }
  if (productCreateSource !== productCreate.source) {
    changes.push({ file: productCreate.file, source: productCreateSource })
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
