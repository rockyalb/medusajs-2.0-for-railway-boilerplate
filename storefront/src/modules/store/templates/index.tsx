import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="content-container flex flex-col px-4 py-6 small:px-6"
      data-testid="category-container"
    >
      <div className="w-full">
        <div className="mb-8 flex items-center gap-4">
          <div className="min-w-0 flex-1 text-2xl-semi">
            <h1 data-testid="store-page-title">Të gjitha produktet</h1>
          </div>
          <Suspense fallback={null}>
            <RefinementList
              sortBy={sort}
              variant="inline"
              data-testid="sort-by-container"
            />
          </Suspense>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
