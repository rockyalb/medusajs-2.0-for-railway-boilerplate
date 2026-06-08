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
  const validPageParam = Math.max(pageParam, 1);
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
      const nextPage = count > offset + limit ? pageParam + 1 : null

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
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const getProductsListWithSort = cache(async function ({
  page = 0,
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
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await getProductsList({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
})
