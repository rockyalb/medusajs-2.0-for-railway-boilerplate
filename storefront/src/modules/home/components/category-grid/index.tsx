import Link from "next/link"

const categories = [
  {
    name: "skin",
    label: "Skin Care",
    description: "Serums, moisturisers & treatments",
    href: "/categories/skin-care",
    tag: "new",
    image: "/placeholder-images/yco-real/category-skin.webp",
    icon: (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10Z" />
        <path d="M12 18c0 2.2 1.8 4 4 4s4-1.8 4-4" />
      </svg>
    ),
  },
  {
    name: "body",
    label: "Body Care",
    description: "Oils, scrubs & lotions",
    href: "/categories/body-care",
    image: "/placeholder-images/yco-real/category-body.webp",
    icon: (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 8h12l2 16H8L10 8Z" />
        <path d="M13 8V6a3 3 0 0 1 6 0v2" />
        <path d="M16 12v6" />
        <path d="M13 15h6" />
      </svg>
    ),
  },
  {
    name: "hair",
    label: "Hair Care",
    description: "Shampoos, masks & styling",
    href: "/categories/hair-care",
    image: "/placeholder-images/yco-real/category-hair.jpg",
    icon: (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 6c-4 0-8 2-8 8 0 3 1.5 5 3 6.5" />
        <path d="M20 6c3 2 4 5 4 8 0 3-1.5 5-3 6.5" />
        <path d="M11 20.5C12 23 14 25 16 26s4-1 5-3" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    ),
  },
  {
    name: "period",
    label: "Period Care",
    description: "Sustainable feminine care",
    href: "/categories/period-care",
    image: "/placeholder-images/yco-real/category-period.webp",
    icon: (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="10" />
        <path d="M16 6c2 3 2 7 0 10s-2 7 0 10" />
        <path d="M6 16c3-2 7-2 10 0s7 2 10 0" />
      </svg>
    ),
  },
  {
    name: "men",
    label: "Men Care",
    description: "Grooming & skincare for men",
    href: "/categories/men-care",
    tag: "new",
    image: "/placeholder-images/yco-real/category-men.jpg",
    icon: (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="12" r="6" />
        <path d="M6 28c0-4.4 4.5-8 10-8s10 3.6 10 8" />
      </svg>
    ),
  },
  {
    name: "home",
    label: "Home Care",
    description: "Natural cleaning & living",
    href: "/categories/home-care",
    image: "/placeholder-images/yco-real/category-home.webp",
    icon: (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14L16 6l10 8v12H6V14Z" />
        <path d="M13 26v-8h6v8" />
      </svg>
    ),
  },
]

export default function CategoryGrid() {
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative flex flex-col justify-between min-h-[300px] rounded-large bg-yco-panel p-7 md:p-8 transition-all duration-300 hover:bg-yco-panel-dark active:scale-[0.99]"
            >
              {/* Tag pill */}
              {cat.tag && (
                <span className="absolute right-6 top-6 rounded-circle bg-yco-charcoal px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  {cat.tag}
                </span>
              )}

              {/* Oversized lowercase word */}
              <h3 className="rhode-display text-5xl md:text-6xl">{cat.name}</h3>

              <div className="mt-8 overflow-hidden rounded-rounded bg-white/55">
                <img
                  src={cat.image}
                  alt={`${cat.label} photography`}
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              {/* Footer of card */}
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <div className="font-sans text-yco-charcoal text-sm font-bold">
                    {cat.label}
                  </div>
                  <p className="font-sans text-yco-charcoal-muted text-xs leading-relaxed mt-1 max-w-[15rem]">
                    {cat.description}
                  </p>
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
