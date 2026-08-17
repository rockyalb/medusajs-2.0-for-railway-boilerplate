import { Heading, Text } from "@medusajs/ui"
import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

type SearchResultsTemplateProps = {
  query: string
  ids: string[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
}

const SearchResultsTemplate = ({
  query,
  ids,
  sortBy,
  page,
  countryCode,
}: SearchResultsTemplateProps) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="content-container flex flex-col px-4 py-6 small:px-6">
      <div className="w-full">
        <div className="mb-8 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <Text className="text-ui-fg-muted">Rezultatet e kërkimit për:</Text>
            <Heading>
              {decodeURI(query)} ({ids.length})
            </Heading>
          </div>
          <LocalizedClientLink
            href="/store"
            className="txt-medium shrink-0 text-ui-fg-subtle hover:text-ui-fg-base"
          >
            Pastro
          </LocalizedClientLink>
          {ids.length > 0 && (
            <Suspense fallback={null}>
              <RefinementList
                sortBy={sort}
                variant="inline"
                data-testid="sort-by-container"
              />
            </Suspense>
          )}
        </div>
        {ids.length > 0 ? (
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              productsIds={ids}
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        ) : (
          <Text>Nuk u gjetën rezultate.</Text>
        )}
      </div>
    </div>
  )
}

export default SearchResultsTemplate
