import Link from "next/link"
import { HttpTypes } from "@medusajs/types"
import type { CategoryProduct } from "./category-product-slider"

type CategoryCard = {
  category: HttpTypes.StoreProductCategory
  products: CategoryProduct[]
}

export default function CategoryGrid({
  categories,
  countryCode,
}: {
  categories: CategoryCard[]
  countryCode: string
}) {
  if (!categories.length) {
    return null
  }

  return (
    <section className="bg-white px-6 py-10 small:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="rhode-eyebrow">Shop by category</span>
            <h2 className="rhode-display mt-3 text-4xl md:text-5xl">
              categories
            </h2>
          </div>
          <Link
            href={`/${countryCode}/store`}
            className="hidden font-sans text-xs font-bold uppercase tracking-[0.18em] text-yco-charcoal transition-colors hover:text-yco-coral small:block"
          >
            View all
          </Link>
        </div>

        <div
          className="-mx-6 overflow-x-auto px-6 pb-3 no-scrollbar small:mx-0 small:px-0"
          role="region"
          aria-label="Product categories"
        >
          <div className="flex snap-x snap-mandatory gap-4">
            {categories.map(({ category, products }, index) => {
              const image = products[0]?.image

              return (
                <Link
                  key={category.id}
                  href={`/${countryCode}/categories/${category.handle}`}
                  className="group relative flex min-h-[360px] w-[78vw] max-w-[25rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-large bg-yco-panel p-5 transition-all duration-300 hover:bg-yco-panel-dark small:w-[38vw] medium:w-[30vw] large:w-[24rem]"
                  aria-label={`Shop ${category.name}`}
                >
                  <div>
                    <h3 className="rhode-display text-5xl md:text-6xl">
                      {category.name.toLowerCase()}
                    </h3>
                    {category.description && (
                      <p className="mt-2 max-w-[17rem] font-sans text-xs leading-relaxed text-yco-charcoal-muted">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div className="my-6 aspect-[4/3] overflow-hidden rounded-rounded bg-white">
                    {image ? (
                      <img
                        src={image}
                        alt={products[0]?.title || category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading={index > 1 ? "lazy" : undefined}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-sans text-6xl font-black lowercase text-yco-charcoal/20">
                        {category.name.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="font-sans text-yco-charcoal text-sm font-bold">
                        {category.name}
                      </div>
                      <p className="mt-1 font-sans text-xs text-yco-charcoal-muted">
                        {products.length} products
                      </p>
                    </div>
                    <span className="rhode-round-btn shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 8l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
