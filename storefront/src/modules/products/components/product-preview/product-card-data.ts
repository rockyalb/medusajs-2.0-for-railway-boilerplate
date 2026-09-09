import type { HttpTypes } from "@medusajs/types"

import { getProductPrice } from "@lib/util/get-product-price"
import type { ProductCardData } from "../product-card"

/**
 * Convert a product that already includes calculated prices into the small,
 * serializable shape consumed by the interactive card.
 *
 * Keeping this mapper separate lets related products reuse one batched store
 * response instead of asking ProductPreview to retrieve every product again.
 */
export function getProductCardData(
  product: HttpTypes.StoreProduct
): ProductCardData {
  const { cheapestPrice } = getProductPrice({ product })
  const gallery = (product.images ?? []).map((image) => image.url)
  const thumbnail = product.thumbnail || gallery[0] || null
  const hoverImage = gallery.find((url) => url && url !== thumbnail) ?? null

  // Quick add only works without option selection, so it targets the sole
  // variant; multi-variant products link to the product page instead.
  const variants = product.variants ?? []
  const quickAddVariant = variants.length === 1 ? variants[0] : null
  const inStock = quickAddVariant
    ? !quickAddVariant.manage_inventory ||
      !!quickAddVariant.allow_backorder ||
      quickAddVariant.inventory_quantity == null ||
      quickAddVariant.inventory_quantity > 0
    : true

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    thumbnail,
    hoverImage,
    price: cheapestPrice?.calculated_price ?? null,
    originalPrice: cheapestPrice?.original_price ?? null,
    isSale: cheapestPrice?.price_type === "sale",
    variantId: quickAddVariant?.id ?? null,
    inStock,
    priceAmount: cheapestPrice?.calculated_price_number ?? null,
    currencyCode: cheapestPrice?.currency_code ?? null,
  }
}
