import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"

export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products)
})

export const getMenuProductsByCategoryIds = cache(async function (
  categoryIds: string[],
  limit: number = 6
) {
  const uniqueCategoryIds = Array.from(new Set(categoryIds.filter(Boolean)))

  const entries = await Promise.all(
    uniqueCategoryIds.map(async (categoryId) => {
      const { products } = await sdk.store.product.list(
        {
          limit,
          category_id: [categoryId],
          fields: "id,title,handle,thumbnail,*images",
        },
        { next: { tags: ["products"] } }
      )

      return [
        categoryId,
        products,
      ] as const
    })
  )

  return Object.fromEntries(entries)
})

export const getProductCountsByCategoryGroups = cache(async function (
  categoryGroups: string[][]
) {
  const entries = await Promise.all(
    categoryGroups.map(async (categoryIds) => {
      const uniqueCategoryIds = Array.from(new Set(categoryIds.filter(Boolean)))
      const groupKey = uniqueCategoryIds[0]

      if (!groupKey) {
        return ["", 0] as const
      }

      const { count } = await sdk.store.product.list(
        {
          limit: 1,
          category_id: uniqueCategoryIds,
          fields: "id",
        },
        { next: { tags: ["products"] } }
      )

      return [groupKey, count] as const
    })
  )

  return Object.fromEntries(entries.filter(([categoryId]) => categoryId))
})

export const getMenuProductsByCollectionIds = cache(async function (
  collectionIds: string[]
) {
  const uniqueCollectionIds = Array.from(new Set(collectionIds.filter(Boolean)))

  const entries = await Promise.all(
    uniqueCollectionIds.map(async (collectionId) => {
      const { products } = await sdk.store.product.list(
        {
          limit: 1,
          collection_id: [collectionId],
          fields: "id,title,handle,thumbnail,*images",
        },
        { next: { tags: ["products"] } }
      )

      return [
        collectionId,
        products,
      ] as const
    })
  )

  return Object.fromEntries(entries)
})

const bestsellerTerms = [
  { phrase: "amla juice", weight: 120 },
  { phrase: "ashwagandha", weight: 110 },
  { phrase: "here we flo", weight: 110 },
  { phrase: "anti hair loss", weight: 110 },
  { phrase: "hair loss", weight: 95 },
  { phrase: "fushi", weight: 70 },
  { phrase: "shampoo", weight: 45 },
  { phrase: "flo", weight: 35 },
]

/**
 * Fetches the admin-curated bestseller products in the order they were
 * curated. Returns [] when nothing is curated so callers can fall back to
 * the heuristic in getBestsellerProducts.
 */
export const getCuratedBestsellerProducts = cache(async function (
  countryCode: string,
  productIds: string[]
) {
  if (!productIds.length) {
    return []
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return []
  }

  const { products } = await sdk.store.product.list(
    {
      id: productIds,
      limit: productIds.length,
      region_id: region.id,
      fields:
        "id,title,handle,subtitle,description,thumbnail,*images,*tags,*variants.calculated_price",
    },
    { next: { tags: ["homepage", "products"] } }
  )

  const productsById = new Map(products.map((product) => [product.id, product]))

  return productIds
    .map((id) => productsById.get(id))
    .filter((product): product is HttpTypes.StoreProduct => !!product)
})

export const getBestsellerProducts = cache(async function (
  countryCode: string,
  limit: number = 6
) {
  const region = await getRegion(countryCode)

  if (!region) {
    return []
  }

  const { products } = await sdk.store.product.list(
    {
      limit: 100,
      region_id: region.id,
      fields:
        "id,title,handle,subtitle,description,thumbnail,*images,*tags,*variants.calculated_price",
    },
    { next: { tags: ["products"] } }
  )

  const scoredProducts = products.map((product) => {
    const searchable = [
      product.title,
      product.subtitle,
      product.description,
      product.handle,
      product.tags?.map((tag) => tag.value).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    const score = bestsellerTerms.reduce((total, term) => {
      return searchable.includes(term.phrase) ? total + term.weight : total
    }, 0)

    return {
      product,
      score,
    }
  })

  const curatedProducts = scoredProducts
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product)

  const fallbackProducts = products.filter(
    (product) =>
      !curatedProducts.some((curatedProduct) => curatedProduct.id === product.id)
  )

  return [...curatedProducts, ...fallbackProducts].slice(0, limit)
})

export const getProductOfTheMonth = cache(async function (
  countryCode: string,
  selectedProductId?: string | null
) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  if (selectedProductId) {
    const { products: selectedProducts } = await sdk.store.product.list(
      {
        id: [selectedProductId],
        region_id: region.id,
        fields: "id,title,handle,subtitle,description,thumbnail,*images,+metadata,*variants.calculated_price",
      },
      { next: { tags: ["products", "homepage"] } }
    )
    if (selectedProducts[0]) return selectedProducts[0]
  }

  const { products } = await sdk.store.product.list(
    {
      limit: 100,
      region_id: region.id,
      fields:
        "id,title,handle,subtitle,description,thumbnail,*images,+metadata,*variants.calculated_price",
    },
    { next: { tags: ["products"] } }
  )

  const candidates = products.filter(
    (product) =>
      product.description && (product.thumbnail || product.images?.length)
  )
  const pool = candidates.length > 0 ? candidates : products

  if (pool.length === 0) {
    return null
  }

  // Seed the pick with the current year-month: random-feeling, but the same
  // product for everyone all month long.
  const now = new Date()
  const monthKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}`
  let seed = 0
  for (const char of monthKey) {
    seed = (seed * 31 + char.charCodeAt(0)) >>> 0
  }

  return pool[seed % pool.length]
})

export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
) {
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+metadata",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products[0])
})

export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12
  const validPageParam = Number.isFinite(pageParam)
    ? Math.max(Math.floor(pageParam), 1)
    : 1
  const offset = (validPageParam - 1) * limit
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }
  return sdk.store.product
    .list(
      {
        limit,
        offset,
        region_id: region.id,
        fields: "*variants.calculated_price",
        ...queryParams,
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? validPageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
})

/**
 * Fetch only the requested page. The API count describes the same filtered catalog.
 * Price sorting is limited to this page until the backend supports calculated-price ordering.
 */
export const getProductsListWithSort = cache(async function ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const result = await getProductsList({
    pageParam: page,
    queryParams: {
      ...queryParams,
      order: "-created_at,id",
    },
    countryCode,
  })

  return {
    ...result,
    response: {
      ...result.response,
      products:
        sortBy === "created_at"
          ? result.response.products
          : sortProducts(result.response.products, sortBy),
    },
  }
})
