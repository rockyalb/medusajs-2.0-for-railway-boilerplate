import type { HttpTypes } from "@medusajs/types"

import { sdk } from "@lib/config"
import { getRegion } from "@lib/data/regions"
import {
  RELATED_PRODUCTS_FIELDS,
  RELATED_PRODUCTS_PAGE_SIZE,
} from "./constants"

/**
 * The related rail starts with two cards and advances from the returned
 * offset. Using an offset instead of page numbers keeps pagination correct
 * when the first response uses a smaller near-viewport limit.
 */
// Prices and inventory are required by ProductCard's quick-add path. The
// image relation is limited to the fields needed for the thumbnail/hover
// treatment so no ProductPreview follow-up requests are necessary.
export type RelatedProductsQuery = {
  countryCode: string
  productId: string
  collectionId?: string | null
  tags?: string[]
}

export type RelatedProductsPageRequest = RelatedProductsQuery & {
  offset?: number
  limit?: number
}

export type RelatedProductsPage = {
  products: HttpTypes.StoreProduct[]
  count: number
  nextOffset: number | null
}

type RelatedStoreProductListParams = HttpTypes.StoreProductListParams & {
  /** Kept for compatibility with the existing storefront recommendation filter. */
  tags?: string[]
}

function normalizeOffset(offset: number | undefined) {
  return Number.isFinite(offset) ? Math.max(Math.floor(offset!), 0) : 0
}

function normalizeLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) {
    return RELATED_PRODUCTS_PAGE_SIZE
  }

  return Math.min(
    Math.max(Math.floor(limit!), 1),
    RELATED_PRODUCTS_PAGE_SIZE
  )
}

/**
 * Fetch one priced/inventory-aware related-product batch. The request is
 * intentionally kept local to this feature so the general catalog helpers
 * can retain their existing fields and cache behavior.
 */
export async function getRelatedProductsPage({
  countryCode,
  productId,
  collectionId,
  tags,
  offset: requestedOffset,
  limit: requestedLimit,
}: RelatedProductsPageRequest): Promise<RelatedProductsPage> {
  const region = await getRegion(countryCode || "al")

  if (!region || !productId) {
    return { products: [], count: 0, nextOffset: null }
  }

  const offset = normalizeOffset(requestedOffset)
  const limit = normalizeLimit(requestedLimit)
  const query: RelatedStoreProductListParams = {
    limit,
    offset,
    region_id: region.id,
    is_giftcard: false,
    fields: RELATED_PRODUCTS_FIELDS,
    ...(collectionId ? { collection_id: [collectionId] } : {}),
    ...(tags?.length ? { tags } : {}),
  }

  const requestOptions = {
    cache: "force-cache" as const,
    next: { tags: ["products", "related-products"], revalidate: 60 },
  }
  const { products, count } = await sdk.store.product.list(query, requestOptions)

  const filteredProducts = products.filter((product) => product.id !== productId)
  const nextOffset = count > offset + limit ? offset + limit : null

  return {
    products: filteredProducts,
    count,
    nextOffset,
  }
}
