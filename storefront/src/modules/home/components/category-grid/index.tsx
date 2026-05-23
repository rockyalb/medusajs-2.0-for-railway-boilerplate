import Link from "next/link"

const categories = [
  {
    name: "Skin Care",
    description: "Serums, moisturisers & treatments",
    href: "/categories/skin-care",
    bg: "#FFF0EE", // soft coral tint
    accentClass: "text-yco-coral stroke-yco-coral",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10Z" />
        <path d="M12 18c0 2.2 1.8 4 4 4s4-1.8 4-4" />
      </svg>
    ),
  },
  {
    name: "Body Care",
    description: "Oils, scrubs & lotions",
    href: "/categories/body-care",
    bg: "#F0F8F5", // soft green tint
    accentClass: "text-yco-green stroke-yco-green",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 8h12l2 16H8L10 8Z" />
        <path d="M13 8V6a3 3 0 0 1 6 0v2" />
        <path d="M16 12v6" />
        <path d="M13 15h6" />
      </svg>
    ),
  },
  {
    name: "Hair Care",
    description: "Shampoos, masks & styling",
    href: "/categories/hair-care",
    bg: "#F0F4FC", // soft blue tint
    accentClass: "text-yco-blue stroke-yco-blue",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 6c-4 0-8 2-8 8 0 3 1.5 5 3 6.5" />
        <path d="M20 6c3 2 4 5 4 8 0 3-1.5 5-3 6.5" />
        <path d="M11 20.5C12 23 14 25 16 26s4-1 5-3" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    ),
  },
  {
    name: "Period Care",
    description: "Sustainable feminine care",
    href: "/categories/period-care",
    bg: "#FAF9F8", // cream
    accentClass: "text-yco-charcoal-muted stroke-yco-charcoal-muted",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="10" />
        <path d="M16 6c2 3 2 7 0 10s-2 7 0 10" />
        <path d="M6 16c3-2 7-2 10 0s7 2 10 0" />
      </svg>
    ),
  },
  {
    name: "Men Care",
    description: "Grooming & skincare for men",
    href: "/categories/men-care",
    bg: "#EAEBED", // light gray
    accentClass: "text-yco-blue stroke-yco-blue",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="12" r="6" />
        <path d="M6 28c0-4.4 4.5-8 10-8s10 3.6 10 8" />
      </svg>
    ),
  },
  {
    name: "Home Care",
    description: "Natural cleaning & living",
    href: "/categories/home-care",
    bg: "#EBF6F8", // soft teal/green-blue
    accentClass: "text-yco-green stroke-yco-green",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14L16 6l10 8v12H6V14Z" />
        <path d="M13 26v-8h6v8" />
      </svg>
    ),
  },
]

export default function CategoryGrid() {
  return (
    <section className="bg-yco-cream py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="text-yco-green font-sans text-xs tracking-[0.3em] uppercase font-medium">Collections</span>
          <h2 className="font-serif text-yco-charcoal text-4xl md:text-5xl mt-3 leading-tight">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group block active:scale-[0.98] transition-transform duration-200"
            >
              <div
                className="relative p-7 md:p-8 rounded-2xl transition-all duration-400 hover:-translate-y-1 hover:shadow-lg border border-yco-cream-dark"
                style={{ backgroundColor: cat.bg }}
              >
                <div className={`mb-5 transition-transform duration-300 group-hover:scale-110 origin-left ${cat.accentClass}`}>
                  {cat.icon}
                </div>
                <h3 className="font-serif text-yco-charcoal text-xl md:text-2xl mb-1.5 leading-tight">
                  {cat.name}
                </h3>
                <p className="font-sans text-yco-charcoal-muted text-xs leading-relaxed mb-5">
                  {cat.description}
                </p>
                <div className="flex items-center gap-2 text-yco-charcoal font-sans text-xs tracking-[0.15em] uppercase font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {/* Bottom border reveal on hover */}
                <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-yco-coral scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-center rounded" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
