import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <Suspense fallback={null}>
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
      </Suspense>
      <div className="w-full">
        <div className="flex flex-row mb-8 text-2xl-semi gap-4">
          {parents &&
            parents.map((parent) => (
              <span key={parent.id} className="text-ui-fg-subtle">
                <LocalizedClientLink
                  className="mr-4 hover:text-black"
                  href={`/categories/${parent.handle}`}
                  data-testid="sort-by-link"
                >
                  {parent.name}
                </LocalizedClientLink>
                /
              </span>
            ))}
          <h1 data-testid="category-page-title">{category.name}</h1>
        </div>
        {category.description && (
          <div className="mb-8 text-base-regular">
            <p>{category.description}</p>
          </div>
        )}
        {childCategories.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-end justify-between gap-4">
              <h2 className="rhode-eyebrow text-yco-charcoal">
                Bli sipas nenkategorise
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {childCategories.map((child) => (
                <LocalizedClientLink
                  key={child.id}
                  href={`/categories/${child.handle}`}
                  className="flex min-h-[64px] items-center justify-center rounded-rounded border border-white/60 bg-white/40 px-4 py-3 text-center font-hanken text-xs font-bold uppercase tracking-[0.08em] text-yco-charcoal shadow-[0_16px_34px_-30px_rgba(47,45,41,0.65)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-yco-charcoal/30 hover:bg-white/70 small:min-w-[11rem] small:shrink-0"
                  aria-label={`Bli ${child.name}`}
                >
                  {child.name}
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
