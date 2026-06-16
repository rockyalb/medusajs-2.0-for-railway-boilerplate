import { Suspense } from "react"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { getMenuProductsByCategoryIds } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavClient from "./nav-client"

export default async function Nav() {
  const { product_categories } = await getCategoriesList(0, 100)
  const { collections } = await getCollectionsList(0, 100)

  const topCategories = (product_categories ?? []).filter(
    (c) => !c.parent_category
  )

  // One product image per top-level category for the megamenu preview card.
  const categoryIds = topCategories.flatMap((c) => [
    c.id,
    ...(c.category_children?.map((child) => child.id) ?? []),
  ])
  const productsByCategoryId = await getMenuProductsByCategoryIds(
    categoryIds,
    1
  ).catch(() => ({} as Record<string, never[]>))

  const imageForCategory = (category: (typeof topCategories)[number]) => {
    const idsToTry = [
      category.id,
      ...(category.category_children?.map((child) => child.id) ?? []),
    ]

    for (const id of idsToTry) {
      const product = productsByCategoryId[id]?.[0]
      const image = product?.thumbnail || product?.images?.[0]?.url

      if (image) {
        return image
      }
    }

    return undefined
  }

  const categories = topCategories.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    image: imageForCategory(c),
    children:
      c.category_children
        .map((child) => ({
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
              className="font-sans text-yco-charcoal text-xs font-bold tracking-[0.14em] uppercase hover:text-yco-coral transition-colors duration-300"
              href="/cart"
              data-testid="nav-cart-link"
            >
              Shporta (0)
            </LocalizedClientLink>
          }
        >
          <CartButton />
        </Suspense>
      }
    />
  )
}
