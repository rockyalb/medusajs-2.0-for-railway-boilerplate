import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import CategoryGrid from "@modules/home/components/category-grid"
import EditorialBanner from "@modules/home/components/editorial-banner"
import FeaturedBrands from "@modules/home/components/featured-brands"
import FeaturedProducts from "@modules/home/components/featured-products"
import LatestBlogPosts from "@modules/home/components/latest-blog-posts"
import MissionSection from "@modules/home/components/mission-section"
import Newsletter from "@modules/home/components/newsletter"
import Testimonials from "@modules/home/components/testimonials"
import TrustBadges from "@modules/home/components/trust-badges"
import { Reveal } from "@modules/common/components/motion"
import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsWithPreviewProducts } from "@lib/data/collections"
import {
  getBestsellerProducts,
  getMenuProductsByCategoryIds,
  getProductCountsByCategoryGroups,
} from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { listWordPressPosts } from "@lib/data/wordpress"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "YCO — Beauty essentials",
  description:
    "A clean, editorial storefront for daily skin, body, and beauty essentials.",
}

const normalizedCategoryName = (name: string) => name.toLowerCase()

const isSkinCareCategory = (category: HttpTypes.StoreProductCategory) =>
  normalizedCategoryName(category.name).includes("skin")

const isPeriodCareCategory = (category: HttpTypes.StoreProductCategory) => {
  const name = normalizedCategoryName(category.name)

  return name.includes("period") || name.includes("menstr")
}

const swapSkinAndPeriodCare = (
  categories: HttpTypes.StoreProductCategory[]
) => {
  const orderedCategories = [...categories]
  const skinCareIndex = orderedCategories.findIndex(isSkinCareCategory)
  const periodCareIndex = orderedCategories.findIndex(isPeriodCareCategory)

  if (skinCareIndex === -1 || periodCareIndex === -1) {
    return orderedCategories
  }

  const skinCareCategory = orderedCategories[skinCareIndex]
  orderedCategories[skinCareIndex] = orderedCategories[periodCareIndex]
  orderedCategories[periodCareIndex] = skinCareCategory

  return orderedCategories
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
  const orderedTopCategories = swapSkinAndPeriodCare(topCategories)
  const categoryIdGroups = topCategories.map((category) => [
    category.id,
    ...(category.category_children?.map((child) => child.id) ?? []),
  ])
  const categoryIds = categoryIdGroups.flat()
  const [productsByCategoryId, productCountsByCategoryId] = await Promise.all([
    getMenuProductsByCategoryIds(categoryIds),
    getProductCountsByCategoryGroups(categoryIdGroups),
  ])
  const categoryCards = orderedTopCategories
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
        productCount: productCountsByCategoryId[category.id] ?? 0,
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
      <CategoryGrid categories={categoryCards} countryCode={countryCode} />
      <MissionSection />

      {bestsellerProducts.length > 0 && region && (
        <section className="bg-white px-6 py-10 small:py-12">
          <Reveal className="max-w-6xl mx-auto mb-7 small:mb-8">
            <span className="rhode-eyebrow inline-flex items-center gap-2">
              <span className="yco-accent-dot" aria-hidden />
              Handpicked for you
            </span>
            <h2 className="rhode-display mt-3 text-4xl md:text-5xl">
              bestsellers
            </h2>
            <div className="yco-tricolor-rule mt-4" />
          </Reveal>
          <FeaturedProducts products={bestsellerProducts} region={region} />
        </section>
      )}

      <FeaturedBrands collections={collectionResponse ?? []} />
      <TrustBadges />
      <EditorialBanner />
      <Testimonials />
      <LatestBlogPosts posts={latestPosts} />
      <Newsletter />
    </div>
  )
}
