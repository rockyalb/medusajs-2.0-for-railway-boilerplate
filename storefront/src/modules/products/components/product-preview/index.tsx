import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

import ProductCard from "../product-card"
import { getProductCardData } from "./product-card-data"

export { getProductCardData }

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

  return (
    <ProductCard
      product={getProductCardData(pricedProduct)}
      featured={isFeatured}
    />
  )
}
