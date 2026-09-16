import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  products,
  region,
  ariaLabel,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  ariaLabel?: string
}) {
  return (
    <ProductRail products={products} region={region} ariaLabel={ariaLabel} />
  )
}
