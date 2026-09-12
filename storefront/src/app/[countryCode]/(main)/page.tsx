import Hero from "@modules/home/components/hero"
import CategoryGrid from "@modules/home/components/category-grid"
import FeaturedBrands from "@modules/home/components/featured-brands"
import HereWeFloSection from "@modules/home/components/here-we-flo"
import EditorialTiles from "@modules/home/components/editorial-tiles"
import ProductOfTheMonth from "@modules/home/components/product-of-the-month"
import FeaturedProducts from "@modules/home/components/featured-products"
import OffersSection from "@modules/home/components/offers"
import LatestBlogPosts from "@modules/home/components/latest-blog-posts"
import Newsletter from "@modules/home/components/newsletter"
import Testimonials from "@modules/home/components/testimonials"
import TrustBadges from "@modules/home/components/trust-badges"
import { Reveal } from "@modules/common/components/motion"
import { Suspense } from "react"
import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsWithPreviewProducts } from "@lib/data/collections"
import { getHomepageSettings } from "@lib/data/homepage"
import {
  getBestsellerProducts,
  getCuratedBestsellerProducts,
  getMenuProductsByCategoryIds,
} from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { listWordPressPosts } from "@lib/data/wordpress"
import { HttpTypes } from "@medusajs/types"

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
    homepageSettings,
    region,
    categoryResponse,
    collectionResponse,
    latestPosts,
  ] = await Promise.all([
    getHomepageSettings(),
    getRegion(countryCode),
    getCategoriesList(0, 100),
    getCollectionsWithPreviewProducts(countryCode, 12),
    listWordPressPosts(3),
  ])

  const curatedBestsellerIds = homepageSettings.bestsellers.product_ids

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

  // The bestseller lookup only depends on homepage settings and the category
  // products only on the category list, so run them side by side instead of
  // as two extra serial round trips before the first byte.
  const [curatedBestsellers, productsByCategoryId] = await Promise.all([
    getCuratedBestsellerProducts(countryCode, curatedBestsellerIds),
    getMenuProductsByCategoryIds(categoryIds),
  ])
  const bestsellerProducts = curatedBestsellers.length
    ? curatedBestsellers
    : await getBestsellerProducts(countryCode)

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
        // Only what the client card needs; the full category object was
        // being serialized into the RSC payload for every card.
        category: {
          id: category.id,
          name: category.name,
          handle: category.handle,
        },
        image: homepageSettings.category_cards.images[category.id] || null,
        products: uniqueProducts.map((product) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.thumbnail || product.images?.[0]?.url || "",
        })),
      }
    })
    .filter(({ products, image }) => products.length > 0 || !!image)

  return (
    <div className="relative">
      <Hero settings={homepageSettings.hero} />
      {bestsellerProducts.length > 0 && region && (
        <section className="yco-section bg-white/40 px-6 pt-8 small:pt-10">
          <Reveal className="font-hanken max-w-6xl mx-auto mb-5 small:mb-6">
            <h2 className="yco-section-title rhode-display text-3xl md:text-4xl">
              Most Loved
            </h2>
          </Reveal>
          <FeaturedProducts products={bestsellerProducts} region={region} />
        </section>
      )}

      {homepageSettings.navigation.show_discounts && (
        <Suspense fallback={null}>
          <OffersSection countryCode={countryCode} />
        </Suspense>
      )}

      <CategoryGrid categories={categoryCards} />

      <FeaturedBrands collections={collectionResponse ?? []} />
      <HereWeFloSection />
      <TrustBadges />
      <EditorialTiles />
      <ProductOfTheMonth countryCode={countryCode} />
      <Testimonials />
      <LatestBlogPosts posts={latestPosts} />
      <Newsletter />
    </div>
  )
}
