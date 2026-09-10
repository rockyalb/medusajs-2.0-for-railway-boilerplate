import "server-only"

import { sdk } from "@lib/config"
import { getRegion } from "@lib/data/regions"
import { getDiscountedVariant } from "@lib/util/discounts"
import type { HttpTypes } from "@medusajs/types"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const DISCOUNTS_PAGE_SIZE = 12

// Medusa has no active-sale product filter. Scan only IDs and regional prices,
// cache the matching set, then hydrate just the requested page. Never filter
// after pagination: that would omit discounts and report the catalog's count.
const getDiscountIndex = unstable_cache(
  async (regionId: string) => {
    const matches = new Map<string, { id: string; amount: number }>()
    const limit = 100
    let offset = 0
    let count = Infinity
    while (offset < count) {
      const result = await sdk.store.product.list(
        {
          region_id: regionId,
          fields: "id,*variants.calculated_price",
          order: "-created_at",
          limit,
          offset,
        },
        { cache: "no-store" }
      )
      count = result.count
      if (!result.products.length) break
      for (const product of result.products) {
        const variant = getDiscountedVariant(product)
        if (variant)
          matches.set(product.id, {
            id: product.id,
            amount: variant.calculated_price!.calculated_amount!,
          })
      }
      offset += result.products.length
    }
    return Array.from(matches.values())
  },
  ["discount-product-index-v1"],
  { revalidate: 60, tags: ["products"] }
)

export const getDiscountedProducts = cache(async function ({
  countryCode,
  page,
  sortBy,
}: {
  countryCode: string
  page: number
  sortBy: SortOptions
}) {
  const region = await getRegion(countryCode)
  if (!region)
    return { products: [] as HttpTypes.StoreProduct[], count: 0, page: 1 }
  const matches = [...(await getDiscountIndex(region.id))]
  if (sortBy === "price_asc") matches.sort((a, b) => a.amount - b.amount)
  if (sortBy === "price_desc") matches.sort((a, b) => b.amount - a.amount)
  const totalPages = Math.max(
    1,
    Math.ceil(matches.length / DISCOUNTS_PAGE_SIZE)
  )
  const currentPage = Math.min(
    totalPages,
    Number.isSafeInteger(page) ? Math.max(1, page) : 1
  )
  const ids = matches
    .slice(
      (currentPage - 1) * DISCOUNTS_PAGE_SIZE,
      currentPage * DISCOUNTS_PAGE_SIZE
    )
    .map(({ id }) => id)
  if (!ids.length) return { products: [], count: 0, page: currentPage }
  const { products } = await sdk.store.product.list(
    {
      id: ids,
      limit: DISCOUNTS_PAGE_SIZE,
      region_id: region.id,
      fields: "*variants.calculated_price,+variants.inventory_quantity",
    },
    { cache: "no-store" }
  )
  const byId = new Map(products.map((product) => [product.id, product]))
  return {
    // Recheck live prices so an offer that expired since the snapshot is hidden.
    products: ids
      .map((id) => byId.get(id))
      .filter(
        (product): product is HttpTypes.StoreProduct =>
          !!product && !!getDiscountedVariant(product)
      ),
    count: matches.length,
    page: currentPage,
  }
})
