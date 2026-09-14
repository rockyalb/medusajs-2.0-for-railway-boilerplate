import { sdk } from "@lib/config"
import { cache } from "react"
import { getProductsList } from "./products"
import { HttpTypes } from "@medusajs/types"

const publicCacheOptions = {
  cache: "force-cache" as const,
  next: { tags: ["collections"], revalidate: 3600 },
}
// Preview products shown on the homepage brand tiles. Uncached, this was one
// live Medusa call per collection on every homepage request and one of the
// things that kept the route from being served as ISR.
const previewProductCacheOptions = {
  cache: "force-cache" as const,
  next: { tags: ["products", "collections"], revalidate: 300 },
}

export const retrieveCollection = cache(async function (id: string) {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionResponse>(`/store/collections/${id}`, {
      query: {},
      ...publicCacheOptions,
    })
    .then(({ collection }) => collection)
})

export const getCollectionsList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>("/store/collections", {
      query: { limit, offset: 0 },
      ...publicCacheOptions,
    })
    .then(({ collections }) => ({ collections, count: collections.length }))
})

export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection> {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>("/store/collections", {
      query: { handle },
      ...publicCacheOptions,
    })
    .then(({ collections }) => collections[0])
})

export const getCollectionsWithProducts = cache(
  async (countryCode: string): Promise<HttpTypes.StoreCollection[] | null> => {
    const { collections } = await getCollectionsList(0, 3)

    if (!collections) {
      return null
    }

    const collectionIds = collections
      .map((collection) => collection.id)
      .filter(Boolean) as string[]

    const { response } = await getProductsList({
      queryParams: { collection_id: collectionIds },
      countryCode,
    })

    response.products.forEach((product) => {
      const collection = collections.find(
        (collection) => collection.id === product.collection_id
      )

      if (collection) {
        if (!collection.products) {
          collection.products = []
        }

        collection.products.push(product as any)
      }
    })

    return collections as unknown as HttpTypes.StoreCollection[]
  }
)

export const getCollectionsWithPreviewProducts = cache(
  async (
    countryCode: string,
    limit: number = 100
  ): Promise<HttpTypes.StoreCollection[]> => {
    const { collections } = await getCollectionsList(0, limit)

    if (!collections.length) {
      return []
    }

    const collectionsWithProducts = await Promise.all(
      collections.map(async (collection) => {
        const { products } =
          await sdk.client.fetch<HttpTypes.StoreProductListResponse>(
            "/store/products",
            {
              query: {
                collection_id: [collection.id],
                limit: 1,
                fields: "id,title,handle,thumbnail,*images,collection_id",
              },
              ...previewProductCacheOptions,
            }
          )

        return {
          ...collection,
          products,
        } as unknown as HttpTypes.StoreCollection
      })
    )

    return collectionsWithProducts
  }
)
