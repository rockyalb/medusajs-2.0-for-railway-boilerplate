import { getProductPrice } from "@lib/util/get-product-price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

import ProductCard from "../product-card"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  const gallery = (pricedProduct.images ?? []).map((image) => image.url)
  const thumbnail = pricedProduct.thumbnail || gallery[0] || null
  const hoverImage = gallery.find((url) => url && url !== thumbnail) ?? null

  // Quick add only works without option selection, so it targets the sole
  // variant; multi-variant products link to the product page instead.
  const variants = pricedProduct.variants ?? []
  const quickAddVariant = variants.length === 1 ? variants[0] : null
  const inStock = quickAddVariant
    ? !quickAddVariant.manage_inventory ||
      !!quickAddVariant.allow_backorder ||
      quickAddVariant.inventory_quantity == null ||
      quickAddVariant.inventory_quantity > 0
    : true

  return (
    <ProductCard
      product={{
        id: pricedProduct.id!,
        handle: product.handle!,
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
      }}
      featured={isFeatured}
    />
  )
}
