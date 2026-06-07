import Link from "next/link"
import { HttpTypes } from "@medusajs/types"
import CategoryProductSlider from "./category-product-slider"
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
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map(({ category, products }, index) => (
            <article
              key={category.id}
              className="group relative flex min-h-[430px] flex-col justify-between overflow-hidden rounded-large bg-yco-panel p-6 transition-all duration-300 hover:bg-yco-panel-dark md:p-8"
            >
              <h3 className="rhode-display text-5xl md:text-6xl">
                {category.name.toLowerCase()}
              </h3>

              <CategoryProductSlider
                products={products}
                countryCode={countryCode}
                categoryName={category.name}
                cardIndex={index}
              />

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <div className="font-sans text-yco-charcoal text-sm font-bold">
                    {category.name}
                  </div>
                  {category.description && (
                    <p className="font-sans text-yco-charcoal-muted text-xs leading-relaxed mt-1 max-w-[15rem]">
                      {category.description}
                    </p>
                  )}
                </div>
                <Link
                  href={`/${countryCode}/categories/${category.handle}`}
                  className="rhode-round-btn shrink-0"
                  aria-label={`Shop ${category.name}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 8l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
