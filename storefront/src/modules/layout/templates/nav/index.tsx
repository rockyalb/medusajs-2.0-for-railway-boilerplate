import { Suspense } from "react"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import {
  BagIcon,
  headerChipClass,
} from "@modules/layout/components/header-controls"
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
              className={`${headerChipClass} small:h-full small:w-auto small:rounded-none small:border-0 small:bg-transparent small:px-2 small:shadow-none small:hover:bg-transparent small:hover:text-yco-coral small:active:scale-100 small:font-hanken small:text-xs small:font-bold small:uppercase small:tracking-[0.14em]`}
              href="/cart"
              aria-label="Hap shportën (0 artikuj)"
              data-testid="nav-cart-link"
            >
              <span className="hidden small:inline">Shporta (0)</span>
              <span className="small:hidden">
                <BagIcon />
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
