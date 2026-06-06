import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import CategoryGrid from "@modules/home/components/category-grid"
import FeaturedBrands from "@modules/home/components/featured-brands"
import FeaturedProducts from "@modules/home/components/featured-products"
import HomeSearch from "@modules/home/components/home-search"
import MissionSection from "@modules/home/components/mission-section"
import Testimonials from "@modules/home/components/testimonials"
import { getCategoriesList } from "@lib/data/categories"
import {
  getCollectionsWithPreviewProducts,
  getCollectionsWithProducts,
} from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "YCO — Beauty essentials",
  description:
    "A clean, editorial storefront for daily skin, body, and beauty essentials.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const [collections, region, categoryResponse, collectionResponse] =
    await Promise.all([
      getCollectionsWithProducts(countryCode),
      getRegion(countryCode),
      getCategoriesList(0, 6),
      getCollectionsWithPreviewProducts(countryCode, 12),
    ])

  const topCategories = (categoryResponse.product_categories ?? []).filter(
    (category) => !category.parent_category
  )

  return (
    <div>
      <Hero />
      <HomeSearch />
      <CategoryGrid categories={topCategories} />
      <FeaturedBrands collections={collectionResponse ?? []} />

      {collections && region && (
        <section className="bg-white py-16 px-6">
          <div className="max-w-6xl mx-auto mb-10">
            <span className="rhode-eyebrow">Handpicked for you</span>
            <div className="mt-3 grid items-end gap-6 md:grid-cols-[1fr_0.58fr]">
              <h2 className="rhode-display text-4xl md:text-5xl">
                bestsellers
              </h2>
              <img
                src="/placeholder-images/yco-real/featured-products.jpg"
                alt="YCO featured product photography"
                className="h-36 w-full rounded-large object-cover"
              />
            </div>
          </div>
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </section>
      )}

      <MissionSection />
      <Testimonials />
    </div>
  )
}
