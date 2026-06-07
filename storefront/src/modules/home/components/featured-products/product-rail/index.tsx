import { HttpTypes } from "@medusajs/types"

import ProductPreview from "@modules/products/components/product-preview"

export default function ProductRail({
  products,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  if (!products.length) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-16">
      <ul className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-4 no-scrollbar small:mx-0 small:grid small:grid-cols-6 small:gap-5 small:overflow-visible small:px-0 small:pb-0">
        {products.slice(0, 6).map((product) => (
          <li
            key={product.id}
            className="w-[68vw] max-w-[280px] shrink-0 snap-start xsmall:w-[42vw] small:w-auto small:max-w-none"
          >
            {/* @ts-ignore */}
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
