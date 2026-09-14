import type { Metadata } from "next"
import { Suspense } from "react"
import { DISCOUNTS_PAGE_SIZE, getDiscountedProducts } from "@lib/data/discounts"
import { getDiscountedVariant } from "@lib/util/discounts"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import { getProductCardData } from "@modules/products/components/product-preview/product-card-data"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { Pagination } from "@modules/store/components/pagination"
import RefinementList from "@modules/store/components/refinement-list"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Oferta",
  description: "Zbulo ofertat aktuale dhe produktet me zbritje në YCO.",
}

async function DiscountProducts({
  countryCode,
  page,
  sortBy,
}: {
  countryCode: string
  page: number
  sortBy: SortOptions
}) {
  const result = await getDiscountedProducts({ countryCode, page, sortBy })
  if (!result.products.length)
    return (
      <div className="py-12 text-center text-yco-charcoal">
        <p className="mb-6 font-hanken text-lg">
          Për momentin nuk ka oferta aktive.
        </p>
        <LocalizedClientLink href="/store" className="yco-btn yco-btn--ink">
          Shiko të gjitha produktet
        </LocalizedClientLink>
      </div>
    )
  return (
    <>
      <ul
        className="grid w-full grid-cols-2 gap-x-3 gap-y-6 small:grid-cols-3 small:gap-x-6 small:gap-y-8 large:grid-cols-4"
        data-testid="discount-products-list"
      >
        {result.products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={getProductCardData(
                product,
                getDiscountedVariant(product)?.id
              )}
            />
          </li>
        ))}
      </ul>
      {result.count > DISCOUNTS_PAGE_SIZE && (
        <Pagination
          page={result.page}
          totalPages={Math.ceil(result.count / DISCOUNTS_PAGE_SIZE)}
        />
      )}
    </>
  )
}

export default async function DiscountsPage({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string; sortBy?: string }>
}) {
  const { countryCode } = await params
  const query = await searchParams
  const sortBy: SortOptions =
    query.sortBy === "price_asc" || query.sortBy === "price_desc"
      ? query.sortBy
      : "created_at"
  const page = Number(query.page || 1)
  return (
    <div className="content-container px-4 py-6 small:px-6">
      <div className="mb-8 flex items-center gap-4">
        <h1 className="min-w-0 flex-1 text-2xl-semi">Oferta</h1>
        <Suspense fallback={null}>
          <RefinementList sortBy={sortBy} variant="inline" />
        </Suspense>
      </div>
      <Suspense key={`${page}-${sortBy}`} fallback={<SkeletonProductGrid />}>
        <DiscountProducts
          countryCode={countryCode}
          page={page}
          sortBy={sortBy}
        />
      </Suspense>
    </div>
  )
}
