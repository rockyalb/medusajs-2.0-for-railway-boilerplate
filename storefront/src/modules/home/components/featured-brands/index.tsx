import Link from "next/link"

const brands = [
  { name: "Bambaw", tagline: "Zero-waste essentials", href: "/collections/bambaw" },
  { name: "Comfort Zone", tagline: "Luxury skin rituals", href: "/collections/comfort-zone" },
  { name: "Davines", tagline: "Sustainable hair care", href: "/collections/davines" },
  { name: "Here We Flo", tagline: "Organic period care", href: "/collections/here-we-flo" },
  { name: "KindBag", tagline: "Recycled bags & totes", href: "/collections/kindbag" },
  { name: "UpCircle", tagline: "Upcycled beauty", href: "/collections/upcircle" },
]

const hoverBgColors = [
  "group-hover:bg-yco-blue",
  "group-hover:bg-yco-green",
  "group-hover:bg-yco-coral",
  "group-hover:bg-yco-blue",
  "group-hover:bg-yco-green",
  "group-hover:bg-yco-coral",
]

export default function FeaturedBrands() {
  return (
    <section className="bg-yco-cream-dark py-20 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-14">
          <span className="font-sans text-yco-green text-xs tracking-[0.3em] uppercase font-medium">Curated Partners</span>
          <h2 className="font-serif text-yco-charcoal text-3xl md:text-4xl mt-3">
            Brands We Trust
          </h2>
          <p className="font-sans text-yco-charcoal-muted text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Every brand is hand-selected for their commitment to sustainability, ethics, and exceptional quality.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((brand, index) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="group bg-yco-cream p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-yco-cream-dark/40"
            >
              {/* Brand initial monogram */}
              <div className={`w-12 h-12 rounded-full bg-yco-cream-dark flex items-center justify-center mb-4 transition-colors duration-300 ${hoverBgColors[index % hoverBgColors.length]}`}>
                <span className="font-serif text-yco-charcoal group-hover:text-yco-cream text-xl font-medium transition-colors duration-300">
                  {brand.name[0]}
                </span>
              </div>
              <div className="font-serif text-yco-charcoal text-sm font-semibold mb-1 leading-tight">
                {brand.name}
              </div>
              <div className="font-sans text-yco-charcoal-muted text-[10px] tracking-wide leading-snug">
                {brand.tagline}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/collections"
            className="font-sans text-yco-charcoal text-xs tracking-[0.2em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-yco-coral hover:border-yco-coral active:scale-95 transition-all duration-300 inline-block"
          >
            View all brands
          </Link>
        </div>

      </div>
    </section>
  )
}
