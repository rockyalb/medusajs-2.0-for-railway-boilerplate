import { Suspense } from "react"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavClient from "./nav-client"

export default async function Nav() {
  const { product_categories } = await getCategoriesList(0, 100)
  const { collections } = await getCollectionsList(0, 100)

  const topCategories = (product_categories ?? []).filter(
    (c) => !c.parent_category
  )

  const categories = topCategories.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    children:
      c.category_children.map((child) => ({
        id: child.id,
        name: child.name,
        handle: child.handle,
      })) ?? [],
  }))

  const simpleCollections = (collections ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    handle: c.handle,
  }))

  return (
    <NavClient
      categories={categories}
      collections={simpleCollections}
      searchEnabled={process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED !== "false"}
      cartButton={
        <Suspense
          fallback={
            <LocalizedClientLink
              className="grid h-14 w-14 place-items-center rounded-circle text-yco-charcoal transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 focus-visible:ring-offset-yco-header-pink small:inline-flex small:min-h-11 small:w-auto small:items-center small:justify-center small:px-2 small:rounded-none small:font-hanken small:text-xs small:font-bold small:uppercase small:tracking-[0.14em] small:hover:bg-transparent small:hover:text-yco-coral"
              href="/cart"
              aria-label="Hap shportën (0 artikuj)"
              data-testid="nav-cart-link"
            >
              <span className="hidden small:inline">Shporta (0)</span>
              <span className="relative small:hidden">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                </svg>
                <span aria-live="polite" className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-circle bg-yco-charcoal px-1 text-[10px] font-bold text-white">
                  0
                </span>
              </span>
            </LocalizedClientLink>
          }
        >
          <CartButton />
        </Suspense>
      }
    />
  )
}
