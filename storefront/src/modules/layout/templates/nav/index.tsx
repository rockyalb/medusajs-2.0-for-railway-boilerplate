import { Suspense } from "react"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import {
  getMenuProductsByCategoryIds,
  getMenuProductsByCollectionIds,
} from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavClient from "./nav-client"

export default async function Nav() {
  const { product_categories } = await getCategoriesList(0, 100)
  const { collections } = await getCollectionsList(0, 100)
  const menuCategoryIds = (product_categories ?? []).flatMap((category) => [
    category.id,
    ...(category.category_children?.map((child) => child.id) ?? []),
  ])
  const collectionIds = (collections ?? []).map((collection) => collection.id)
  const [productsByCategoryId, productsByCollectionId] = await Promise.all([
    getMenuProductsByCategoryIds(menuCategoryIds),
    getMenuProductsByCollectionIds(collectionIds),
  ])

  const categories = (product_categories ?? [])
    .filter((c) => !c.parent_category)
    .map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      products:
        productsByCategoryId[c.id]?.map((product) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.thumbnail || product.images?.[0]?.url || "",
        })) ?? [],
      children:
        c.category_children
          .map((child) => ({
            id: child.id,
            name: child.name,
            handle: child.handle,
            products:
              productsByCategoryId[child.id]?.map((product) => ({
                id: product.id,
                title: product.title,
                handle: product.handle,
                image: product.thumbnail || product.images?.[0]?.url || "",
              })) ?? [],
          })) ?? [],
    }))

  const simpleCollections = (collections ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    handle: c.handle,
    products:
      productsByCollectionId[c.id]?.map((product) => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
        image: product.thumbnail || product.images?.[0]?.url || "",
      })) ?? [],
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
