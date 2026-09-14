type CalculatedPrice = {
  calculated_amount?: number | null
  original_amount?: number | null
  currency_code?: string | null
  calculated_price?: { price_list_type?: string | null } | null
}

/** Use the same single-unit regional sale calculation as the storefront. */
export function getCatalogPrice(calculated?: CalculatedPrice | null) {
  const amount = calculated?.calculated_amount
  const original = calculated?.original_amount
  const currency = calculated?.currency_code?.toUpperCase()
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !currency
  )
    return null
  const onSale =
    calculated?.calculated_price?.price_list_type === "sale" &&
    typeof original === "number" &&
    Number.isFinite(original) &&
    original > 0 &&
    original > amount
  return {
    price: `${(onSale ? original : amount).toFixed(2)} ${currency}`,
    salePrice: onSale ? `${amount.toFixed(2)} ${currency}` : null,
  }
}
