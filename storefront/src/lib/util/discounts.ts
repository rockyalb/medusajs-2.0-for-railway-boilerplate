import type { HttpTypes } from "@medusajs/types"

export function isDiscountedVariant(variant: HttpTypes.StoreProductVariant) {
  const price = variant.calculated_price
  return (
    price?.calculated_price?.price_list_type === "sale" &&
    typeof price.original_amount === "number" &&
    typeof price.calculated_amount === "number" &&
    price.original_amount > 0 &&
    price.calculated_amount >= 0 &&
    price.calculated_amount < price.original_amount
  )
}

export function getDiscountedVariant(product: HttpTypes.StoreProduct) {
  return product.variants
    ?.filter(isDiscountedVariant)
    .sort(
      (a, b) =>
        a.calculated_price!.calculated_amount! -
        b.calculated_price!.calculated_amount!
    )[0]
}
