import { Suspense } from "react"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavClient from "./nav-client"

export default async function Nav() {
  const { product_categories } = await getCategoriesList(0, 6)
  const { collections } = await getCollectionsList(0, 6)

  const categories = (product_categories ?? [])
    .filter((c) => !c.parent_category)
    .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))

  const simpleCollections = (collections ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    handle: c.handle,
  }))

  return (
    <NavClient
      categories={categories}
      collections={simpleCollections}
      searchEnabled={!!process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED}
      cartButton={
        <Suspense
          fallback={
            <LocalizedClientLink
              className="font-sans text-yco-charcoal text-xs font-bold tracking-[0.14em] uppercase hover:text-yco-coral transition-colors duration-300"
              href="/cart"
              data-testid="nav-cart-link"
            >
              Cart (0)
            </LocalizedClientLink>
          }
        >
          <CartButton />
        </Suspense>
      }
    />
  )
}
