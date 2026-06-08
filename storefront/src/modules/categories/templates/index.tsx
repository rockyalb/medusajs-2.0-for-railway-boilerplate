import { notFound } from "next/navigation"
import Image from "next/image"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getMenuProductsByCategoryIds } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

type SubcategoryCard = {
  category: HttpTypes.StoreProductCategory
  image: string
  imageAlt: string
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
  const productsByCategoryId = childCategories.length
    ? await getMenuProductsByCategoryIds(
        childCategories.map((child) => child.id),
        1
      )
    : {}

  const subcategoryCards: SubcategoryCard[] = childCategories.map((child) => {
    const previewProduct = productsByCategoryId[child.id]?.[0]

    return {
      category: child,
      image:
        previewProduct?.thumbnail || previewProduct?.images?.[0]?.url || "",
      imageAlt: previewProduct?.title || child.name,
    }
  })

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} data-testid="sort-by-container" />
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
        {subcategoryCards.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-end justify-between gap-4">
              <h2 className="rhode-eyebrow text-yco-charcoal">
                Shop by subcategory
              </h2>
            </div>
            <div className="grid grid-flow-col auto-cols-[9.5rem] gap-3 overflow-x-auto pb-2 small:auto-cols-[calc((100%-3.75rem)/6)]">
              {subcategoryCards.map(
                ({ category: child, image, imageAlt }, index) => (
                  <LocalizedClientLink
                    key={child.id}
                    href={`/categories/${child.handle}`}
                    className="group flex h-40 flex-col overflow-hidden rounded-rounded bg-yco-panel p-2 transition-all duration-300 hover:bg-yco-panel-dark small:h-44"
                    aria-label={`Shop ${child.name}`}
                  >
                    <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-base bg-white">
                      {image ? (
                        <Image
                          src={image}
                          alt={imageAlt}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          fill
                          sizes="(min-width: 640px) 160px, 152px"
                          loading={index > 3 ? "lazy" : undefined}
                          priority={index <= 3}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-sans text-5xl font-black lowercase text-yco-charcoal/20">
                          {child.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex min-h-0 flex-1 items-end justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-sans text-xs font-bold uppercase leading-tight tracking-[0.06em] text-yco-charcoal">
                          {child.name}
                        </h3>
                      </div>
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-circle border border-yco-charcoal/25 bg-white/80 text-yco-charcoal transition-colors group-hover:bg-yco-charcoal group-hover:text-white"
                        aria-hidden="true"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M9 8l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </LocalizedClientLink>
                )
              )}
            </div>
          </div>
        )}
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
