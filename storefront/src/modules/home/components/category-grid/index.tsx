import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

const categoryImages = [
  "/placeholder-images/yco-real/category-skin.webp",
  "/placeholder-images/yco-real/category-body.webp",
  "/placeholder-images/yco-real/category-hair.jpg",
  "/placeholder-images/yco-real/category-period.webp",
  "/placeholder-images/yco-real/category-men.jpg",
  "/placeholder-images/yco-real/category-home.webp",
]

export default function CategoryGrid({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  if (!categories.length) {
    return null
  }

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="group relative flex flex-col justify-between min-h-[300px] rounded-large bg-yco-panel p-7 md:p-8 transition-all duration-300 hover:bg-yco-panel-dark active:scale-[0.99]"
            >
              <h3 className="rhode-display text-5xl md:text-6xl">
                {cat.name.toLowerCase()}
              </h3>

              <div className="mt-8 overflow-hidden rounded-rounded bg-white/55">
                <img
                  src={categoryImages[index % categoryImages.length]}
                  alt={`${cat.name} category`}
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading={index > 2 ? "lazy" : undefined}
                />
              </div>

              <div className="mt-8 flex items-end justify-between">
                <div>
                  <div className="font-sans text-yco-charcoal text-sm font-bold">
                    {cat.name}
                  </div>
                  {cat.description && (
                    <p className="font-sans text-yco-charcoal-muted text-xs leading-relaxed mt-1 max-w-[15rem]">
                      {cat.description}
                    </p>
                  )}
                </div>
                <span className="text-yco-charcoal-muted transition-transform duration-300 group-hover:translate-x-1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1" />
                    <path d="M9 8l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
