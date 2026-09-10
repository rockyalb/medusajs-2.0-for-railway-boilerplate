import { Suspense } from "react"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { getHomepageSettings } from "@lib/data/homepage"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import {
  BagIcon,
  cartButtonClass,
  cartLabelClass,
} from "@modules/layout/components/header-controls"
import NavClient from "./nav-client"

export default async function Nav() {
  const [{ product_categories }, { collections }, homepage] = await Promise.all(
    [
      getCategoriesList(0, 100),
      getCollectionsList(0, 100),
      getHomepageSettings(),
    ]
  )

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
      showDiscounts={homepage.navigation.show_discounts}
      searchEnabled={process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED !== "false"}
      cartButton={
        <Suspense
          fallback={
            <LocalizedClientLink
              className={cartButtonClass}
              href="/cart"
              aria-label="Hap shportën (0 artikuj)"
              data-testid="nav-cart-link"
            >
              <span className={cartLabelClass}>Shporta (0)</span>
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
