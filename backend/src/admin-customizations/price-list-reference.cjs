// Admin product prices contain regular catalog prices (Medusa excludes price lists).
// Select the single-unit reference, never a bulk tier or another currency.
function getReferencePrice(prices, currencyCode, regionId) {
  const eligible = (prices || []).filter((price) =>
    price.currency_code?.toLowerCase() === currencyCode?.toLowerCase() &&
    !price.price_list_id &&
    typeof price.amount === "number" && Number.isFinite(price.amount) &&
    (price.min_quantity == null || price.min_quantity <= 1) &&
    (price.max_quantity == null || price.max_quantity >= 1)
  )
  const base = eligible.filter((price) => Object.keys(price.rules || {}).length === 0)
  const regional = regionId ? eligible.filter((price) => {
    const rules = price.rules || {}
    return Object.keys(rules).length === 1 && rules.region_id === regionId
  }) : []
  const matches = regional.length ? regional : base
  return matches.length ? Math.min(...matches.map((price) => price.amount)) : null
}

function addReferencePriceColumns(columns, { regions, columnHelper, DataGrid, jsx, t }) {
  return columns.flatMap((column) => {
    const isCurrency = column.id?.startsWith("currency_prices.")
    const isRegion = column.id?.startsWith("region_prices.")
    if (!isCurrency && !isRegion) return [column]

    const key = column.id.slice(column.id.indexOf(".") + 1)
    const region = isRegion ? regions.find((item) => item.id === key) : undefined
    const currency = isCurrency ? key : region?.currency_code
    const label = t("yco.priceLists.currentPrice", {
      defaultValue: "Current price {{scope}}",
      scope: isCurrency ? currency.toUpperCase() : region?.name || key,
    })
    const description = t("yco.priceLists.referenceDescription", {
      defaultValue: "Regular catalog price for one item, before price-list offers. Regional prices fall back to the currency price.",
    })
    const reference = columnHelper.column({
      id: `reference.${column.id}`,
      name: label,
      size: 190,
      header: () => jsx("span", { title: description, children: label }),
      cell: (context) => {
        const entity = context.row.original
        // Product heading rows have variants; only variant rows have prices.
        if (!entity.product_id) return jsx(DataGrid.ReadonlyCell, { context })
        const amount = getReferencePrice(entity.prices, currency, region?.id)
        const value = amount == null
          ? t("yco.priceLists.noPrice", { defaultValue: "Not set" })
          : new Intl.NumberFormat(undefined, {
              style: "currency", currency: currency.toUpperCase(),
            }).format(amount)
        return jsx(DataGrid.ReadonlyCell, {
          context, color: "normal",
          children: jsx("span", { title: description, children: value }),
        })
      },
    })
    return [reference, column]
  })
}

module.exports = { getReferencePrice, addReferencePriceColumns }
