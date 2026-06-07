import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import CategoryGrid from "@modules/home/components/category-grid"
import FeaturedBrands from "@modules/home/components/featured-brands"
import FeaturedProducts from "@modules/home/components/featured-products"
import HomeSearch from "@modules/home/components/home-search"
import LatestBlogPosts from "@modules/home/components/latest-blog-posts"
import MissionSection from "@modules/home/components/mission-section"
import Testimonials from "@modules/home/components/testimonials"
import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsWithPreviewProducts } from "@lib/data/collections"
import {
  getBestsellerProducts,
  getMenuProductsByCategoryIds,
} from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { listWordPressPosts } from "@lib/data/wordpress"
import { HttpTypes } from "@medusajs/types"

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
  const [
    bestsellerProducts,
    region,
    categoryResponse,
    collectionResponse,
    latestPosts,
  ] =
    await Promise.all([
      getBestsellerProducts(countryCode),
      getRegion(countryCode),
      getCategoriesList(0, 100),
      getCollectionsWithPreviewProducts(countryCode, 12),
      listWordPressPosts(3),
    ])

  const topCategories = (
    (categoryResponse.product_categories ??
      []) as HttpTypes.StoreProductCategory[]
  ).filter((category) => !category.parent_category)
  const categoryIds = topCategories.flatMap((category) => [
    category.id,
    ...(category.category_children?.map((child) => child.id) ?? []),
  ])
  const productsByCategoryId = await getMenuProductsByCategoryIds(categoryIds)
  const categoryCards = topCategories
    .map((category) => {
      const categoryProducts = [
        ...(productsByCategoryId[category.id] ?? []),
        ...(category.category_children?.flatMap(
          (child) => productsByCategoryId[child.id] ?? []
        ) ?? []),
      ]
      const uniqueProducts = Array.from(
        new Map(
          categoryProducts.map((product) => [product.id, product])
        ).values()
      )

      return {
        category,
        products: uniqueProducts.map((product) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.thumbnail || product.images?.[0]?.url || "",
        })),
      }
    })
    .filter(({ products }) => products.length > 0)

  return (
    <div>
      <Hero />
      <HomeSearch />
      <CategoryGrid categories={categoryCards} countryCode={countryCode} />
      <FeaturedBrands collections={collectionResponse ?? []} />

      {bestsellerProducts.length > 0 && region && (
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
          <FeaturedProducts products={bestsellerProducts} region={region} />
        </section>
      )}

      <MissionSection />
      <LatestBlogPosts posts={latestPosts} />
      <Testimonials />
    </div>
  )
}
