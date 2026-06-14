import { listCategories } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { getProductsList } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { listWordPressPages, listWordPressPosts } from "@lib/data/wordpress"
import { getBaseURL } from "@lib/util/env"
import type { HttpTypes } from "@medusajs/types"
import type { MetadataRoute } from "next"

export const dynamic = "force-dynamic"

type SitemapEntry = MetadataRoute.Sitemap[number]

const DEFAULT_COUNTRY_CODE = process.env.NEXT_PUBLIC_DEFAULT_REGION || "al"

function absoluteUrl(path: string) {
  return new URL(path, getBaseURL()).toString()
}

function toDate(value?: string | Date | null) {
  return value ? new Date(value) : new Date()
}

async function getCountryCodes() {
  const regions = await listRegions()
  const countryCodes = regions
    ?.flatMap((region) => region.countries?.map((country) => country.iso_2))
    .filter(Boolean) as string[] | undefined

  return countryCodes?.length
    ? Array.from(new Set(countryCodes))
    : [DEFAULT_COUNTRY_CODE]
}

async function getProducts(countryCode: string) {
  const products: HttpTypes.StoreProduct[] = []
  const limit = 100
  let pageParam = 1

  while (true) {
    const {
      response: { products: batch },
      nextPage,
    } = await getProductsList({
      countryCode,
      pageParam,
      queryParams: {
        limit,
        fields: "handle,updated_at,created_at",
      },
    })

    products.push(...batch)

    if (!nextPage) {
      break
    }

    pageParam = nextPage
  }

  return products
}

function flattenCategories(
  categories: HttpTypes.StoreProductCategory[],
  parentPath: string[] = []
): HttpTypes.StoreProductCategory[] {
  return categories.flatMap((category) => {
    const path = [...parentPath, category.handle].filter(Boolean)

    return [
      {
        ...category,
        handle: path.join("/"),
      },
      ...flattenCategories(category.category_children ?? [], path),
    ]
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const countryCodes = await getCountryCodes()
  const [categoryResponse, collectionResponse, wordpressPages, wordpressPosts] =
    await Promise.all([
      listCategories(),
      getCollectionsList(0, 100),
      listWordPressPages(),
      listWordPressPosts(100),
    ])

  const categories = flattenCategories(
    (categoryResponse ?? []) as HttpTypes.StoreProductCategory[]
  )
  const collections = collectionResponse.collections ?? []
  const wordpressEntries = [...wordpressPages, ...wordpressPosts]

  const entries: SitemapEntry[] = []

  for (const countryCode of countryCodes) {
    entries.push(
      {
        url: absoluteUrl(`/${countryCode}`),
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: absoluteUrl(`/${countryCode}/store`),
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: absoluteUrl(`/${countryCode}/collections`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: absoluteUrl(`/${countryCode}/blog`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
      }
    )

    entries.push(
      ...collections
        .filter((collection) => collection.handle)
        .map((collection) => ({
          url: absoluteUrl(`/${countryCode}/collections/${collection.handle}`),
          lastModified: toDate(collection.updated_at || collection.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ...categories
        .filter((category) => category.handle)
        .map((category) => ({
          url: absoluteUrl(`/${countryCode}/categories/${category.handle}`),
          lastModified: toDate(category.updated_at || category.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })),
      ...wordpressEntries
        .filter((entry) => entry.slug)
        .map((entry) => ({
          url: absoluteUrl(`/${countryCode}/${entry.slug}`),
          lastModified: toDate(entry.modified || entry.date),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        }))
    )

    const products = await getProducts(countryCode)

    entries.push(
      ...products
        .filter((product) => product.handle)
        .map((product) => ({
          url: absoluteUrl(`/${countryCode}/products/${product.handle}`),
          lastModified: toDate(product.updated_at || product.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
    )
  }

  return Array.from(
    new Map(entries.map((entry) => [entry.url, entry])).values()
  )
}
