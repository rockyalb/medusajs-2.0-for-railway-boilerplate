import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

type CategoryProduct = {
  id: string
  title: string
  handle: string
  image: string
}

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

              <div
                className="-mx-6 mt-8 overflow-x-auto px-6 pb-3 no-scrollbar md:-mx-8 md:px-8"
                role="region"
                aria-label={`${category.name} products`}
              >
                <div className="flex snap-x snap-mandatory gap-3">
                  {products.slice(0, 8).map((product, productIndex) => (
                    <Link
                      key={product.id}
                      href={`/${countryCode}/products/${product.handle}`}
                      className="group/product w-[68%] min-w-[12rem] max-w-[15rem] shrink-0 snap-start rounded-rounded bg-white/70 p-3 transition-transform duration-300 hover:-translate-y-1 sm:w-[54%] lg:w-[72%]"
                    >
                      <div className="aspect-square overflow-hidden rounded-base bg-white">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/product:scale-[1.04]"
                            loading={
                              index > 1 || productIndex > 1 ? "lazy" : undefined
                            }
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-sans text-5xl font-black lowercase text-yco-charcoal/20">
                            {product.title.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 line-clamp-2 min-h-[2rem] font-sans text-xs font-bold uppercase leading-tight tracking-[0.06em] text-yco-charcoal">
                        {product.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

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
