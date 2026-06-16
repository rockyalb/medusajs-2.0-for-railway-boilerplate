import Link from "next/link"
import { HttpTypes } from "@medusajs/types"
import { BRAND_LOGOS } from "@lib/data/brand-logos"
import { Reveal, Stagger, StaggerItem } from "@modules/common/components/motion"

type BrandCollection = HttpTypes.StoreCollection & {
  products?: HttpTypes.StoreProduct[]
}

export default function FeaturedBrands({
  collections,
}: {
  collections: BrandCollection[]
}) {
  const brands = collections.slice(0, 12)

  if (!brands.length) {
    return null
  }

  // Full literal class names so Tailwind keeps these hand-written @layer rules.
  const accentClasses = [
    "yco-accent--mint",
    "yco-accent--coral",
    "yco-accent--blue",
  ] as const

  return (
    <section className="bg-yco-cream-dark px-6 py-12 small:py-14">
      <div className="max-w-6xl mx-auto">

        <Reveal className="text-center mb-9 small:mb-10">
          <span className="font-sans text-pastel-mint-ink text-xs tracking-[0.3em] uppercase font-semibold">Partnerë të përzgjedhur</span>
          <h2 className="font-serif text-yco-charcoal text-3xl md:text-4xl mt-3">
            Brende që u besojmë
          </h2>
          <div className="yco-tricolor-rule mt-4 mx-auto" />
          <p className="font-sans text-yco-charcoal-muted text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Çdo brend përzgjidhet me kujdes për cilësinë, etikën dhe përkushtimin ndaj qëndrueshmërisë.
          </p>
        </Reveal>

        <Stagger
          stagger={0.06}
          role="list"
          className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-6"
        >
          {brands.map((brand, index) => {
            const logo = brand.handle ? BRAND_LOGOS[brand.handle] : undefined
            const accentClass = accentClasses[index % accentClasses.length]

            return (
            <StaggerItem
              key={brand.id}
              role="listitem"
              className="w-[42vw] min-w-[9.5rem] max-w-[12rem] shrink-0 md:w-auto md:min-w-0 md:max-w-none"
            >
            <Link
              href={`/collections/${brand.handle}`}
              className={`group ${accentClass} flex h-full flex-col rounded-2xl border border-yco-cream-dark/40 bg-yco-cream p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-[0_20px_42px_-20px_var(--accent-glow)] active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2`}
            >
              <div className="mb-4 aspect-square overflow-hidden rounded-large bg-white flex items-center justify-center p-5">
                {logo ? (
                  <img
                    src={logo}
                    alt={`${brand.title} logo`}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-serif text-yco-charcoal text-3xl font-medium">
                      {brand.title[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="font-serif text-yco-charcoal text-sm font-semibold mb-1 leading-tight text-center">
                {brand.title}
              </div>
              <div className="font-sans text-yco-charcoal-muted text-[10px] tracking-wide leading-snug text-center">
                Shop brand
              </div>
            </Link>
            </StaggerItem>
          )})}
        </Stagger>

        <div className="text-center mt-8">
          <Link
            href="/collections"
            className="font-sans text-yco-charcoal text-xs tracking-[0.2em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-pastel-coral-ink hover:border-pastel-coral-ink active:scale-95 transition-all duration-300 inline-block"
          >
            View all brands
          </Link>
        </div>

      </div>
    </section>
  )
}
