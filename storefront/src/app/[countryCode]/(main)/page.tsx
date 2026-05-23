import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import TrustBadges from "@modules/home/components/trust-badges"
import CategoryGrid from "@modules/home/components/category-grid"
import FeaturedProducts from "@modules/home/components/featured-products"
import MissionSection from "@modules/home/components/mission-section"
import FeaturedBrands from "@modules/home/components/featured-brands"
import Testimonials from "@modules/home/components/testimonials"
import Newsletter from "@modules/home/components/newsletter"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "YCO Organics — Good for you, good for the planet",
  description:
    "The home of certified organic, zero-waste, and natural beauty & wellness products. Cruelty-free, plastic-free, non-toxic.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  return (
    <div>
      <Hero />
      <TrustBadges />
      <CategoryGrid />

      {collections && region && (
        <section className="bg-yco-cream py-20 px-6 border-t border-yco-cream-dark">
          <div className="max-w-6xl mx-auto mb-12">
            <span className="font-sans text-yco-green text-xs tracking-[0.3em] uppercase font-medium">
              Handpicked for you
            </span>
            <h2 className="font-serif text-yco-charcoal text-4xl md:text-5xl mt-3 leading-tight">
              Featured Products
            </h2>
          </div>
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </section>
      )}

      <MissionSection />
      <FeaturedBrands />
      <Testimonials />
      <Newsletter />
    </div>
  )
}
