import { Metadata } from "next"
import Link from "next/link"

import { getCollectionsWithPreviewProducts } from "@lib/data/collections"
import { BRAND_LOGOS } from "@lib/data/brand-logos"

export const metadata: Metadata = {
  title: "Brands | YCO",
  description: "Browse YCO brand collections.",
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithPreviewProducts(
    countryCode,
    100
  )

  return (
    <main className="bg-yco-cream min-h-screen">
      <section className="content-container py-14 small:py-20">
        <div className="max-w-3xl">
          <span className="rhode-eyebrow">Brands</span>
          <h1 className="rhode-display mt-3 text-5xl small:text-6xl">
            shop by brand
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-sm leading-6 text-yco-charcoal-muted">
            Explore the collections imported into Medusa.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 small:grid-cols-2 medium:grid-cols-3">
          {collections.map((collection) => {
            const logo = collection.handle ? BRAND_LOGOS[collection.handle] : undefined

            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group rounded-large bg-white p-4 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-5 aspect-[4/3] overflow-hidden rounded-base bg-white flex items-center justify-center p-8 border border-yco-cream-dark/40">
                  {logo ? (
                    <img
                      src={logo}
                      alt={`${collection.title} logo`}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-serif text-4xl text-yco-charcoal">
                        {collection.title.slice(0, 1)}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="font-sans text-sm font-bold uppercase tracking-[0.08em] text-yco-charcoal">
                  {collection.title}
                </h2>
                <p className="mt-2 font-sans text-xs text-yco-charcoal-muted">
                  Shop brand
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
