import { listCategories } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { getProductsList } from "@lib/data/products"
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

  entries.push(
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/store"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/collections"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    }
  )

  entries.push(
    ...collections
      .filter((collection) => collection.handle)
      .map((collection) => ({
        url: absoluteUrl(`/collections/${collection.handle}`),
        lastModified: toDate(collection.updated_at || collection.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...categories
      .filter((category) => category.handle)
      .map((category) => ({
        url: absoluteUrl(`/categories/${category.handle}`),
        lastModified: toDate(category.updated_at || category.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ...wordpressEntries
      .filter((entry) => entry.slug)
      .map((entry) => ({
        url: absoluteUrl(`/${entry.slug}`),
        lastModified: toDate(entry.modified || entry.date),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
  )

  const products = await getProducts(DEFAULT_COUNTRY_CODE)

  entries.push(
    ...products
      .filter((product) => product.handle)
      .map((product) => ({
        url: absoluteUrl(`/products/${product.handle}`),
        lastModified: toDate(product.updated_at || product.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
  )

  return Array.from(
    new Map(entries.map((entry) => [entry.url, entry])).values()
  )
}
