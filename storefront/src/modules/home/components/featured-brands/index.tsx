import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

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

        <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-6">
          {brands.map((brand) => {
            const product = brand.products?.[0]
            const image = product?.thumbnail || product?.images?.[0]?.url

            return (
            <Link
              key={brand.id}
              href={`/collections/${brand.handle}`}
              className="group flex w-[42vw] min-w-[9.5rem] max-w-[12rem] shrink-0 flex-col rounded-2xl border border-yco-cream-dark/40 bg-yco-cream p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 md:w-auto md:min-w-0 md:max-w-none"
            >
              <div className="mb-4 aspect-square overflow-hidden rounded-large bg-yco-cream-dark">
                {image ? (
                  <img
                    src={image}
                    alt={product?.title || brand.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
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
                {product?.title || "Shop brand"}
              </div>
            </Link>
          )})}
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
