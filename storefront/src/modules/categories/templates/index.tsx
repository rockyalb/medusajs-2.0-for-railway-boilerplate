import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SubcategoryDropdown from "@modules/categories/components/subcategory-dropdown"
import { HttpTypes } from "@medusajs/types"

export default async function CategoryTemplate({
  categories,
  sortBy,
  page,
  countryCode,
}: {
  categories: HttpTypes.StoreProductCategory[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const category = categories[categories.length - 1]
  const parents = categories.slice(0, categories.length - 1)

  if (!category || !countryCode) notFound()

  const childCategories = category.category_children ?? []

  return (
    <div
      className="content-container flex flex-col px-4 py-6 small:px-6"
      data-testid="category-container"
    >
      <div className="w-full">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex min-w-0 flex-1 flex-row flex-wrap text-2xl-semi gap-4">
            {parents &&
              parents.map((parent) => (
                <span key={parent.id} className="text-ui-fg-subtle">
                  <LocalizedClientLink
                    className="mr-4 hover:text-black"
                    href={`/categories/${parent.handle}`}
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  /
                </span>
              ))}
            <h1 data-testid="category-page-title">{category.name}</h1>
          </div>
          <Suspense fallback={null}>
            <RefinementList
              sortBy={sort}
              variant="inline"
              data-testid="sort-by-container"
            />
          </Suspense>
        </div>
        {category.description && (
          <div className="mb-8 text-base-regular">
            <p>{category.description}</p>
          </div>
        )}
        {childCategories.length > 0 && (
          <SubcategoryDropdown categories={childCategories} />
        )}
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryIds={[
              category.id,
              ...childCategories.map((child) => child.id),
            ]}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
