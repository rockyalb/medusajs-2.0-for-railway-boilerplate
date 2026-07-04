import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const formatSubcategoryName = (name: string) => {
  const lowerName = name.trim().toLocaleLowerCase("sq-AL")

  return lowerName
    ? lowerName.charAt(0).toLocaleUpperCase("sq-AL") + lowerName.slice(1)
    : name
}

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
      className="flex flex-col py-6 content-container"
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
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {childCategories.map((child) => (
                <LocalizedClientLink
                  key={child.id}
                  href={`/categories/${child.handle}`}
                  className="flex min-h-[64px] items-center justify-center rounded-rounded border border-white/60 bg-white/40 px-4 py-3 text-center font-hanken text-xs font-bold tracking-[0.08em] text-yco-charcoal shadow-[0_16px_34px_-30px_rgba(47,45,41,0.65)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-yco-charcoal/30 hover:bg-white/70 small:min-w-[11rem] small:shrink-0"
                  aria-label={`Bli ${child.name}`}
                >
                  {formatSubcategoryName(child.name)}
                </LocalizedClientLink>
              ))}
            </div>
          </div>
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
