import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const { products } = collection

  if (!products) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-16">
      <div className="flex items-end justify-between mb-8">
        <h3 className="rhode-display text-3xl md:text-4xl">
          {collection.title.toLowerCase()}
        </h3>
        <LocalizedClientLink
          href={`/collections/${collection.handle}`}
          className="font-sans text-yco-charcoal text-[11px] font-bold uppercase tracking-[0.18em] hover:text-yco-coral transition-colors"
        >
          View all
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
        {products &&
          products.map((product) => (
            <li key={product.id}>
              {/* @ts-ignore */}
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
