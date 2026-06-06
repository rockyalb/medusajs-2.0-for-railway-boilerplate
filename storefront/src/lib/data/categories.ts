import { sdk } from "@lib/config"
import { cache } from "react"

const SEED_CATEGORY_HANDLES = ["shirts", "sweatshirts", "pants", "merch"]

const removeSeedCategories = <T extends { handle?: string; category_children?: T[] }>(
  categories: T[]
) =>
  categories
    .filter((category) => !SEED_CATEGORY_HANDLES.includes(category.handle ?? ""))
    .map((category) => ({
      ...category,
      category_children: category.category_children
        ? removeSeedCategories(category.category_children)
        : category.category_children,
    }))

export const listCategories = cache(async function () {
  return sdk.store.category
    .list({ fields: "+category_children" }, { next: { tags: ["categories"] } })
    .then(({ product_categories }) => removeSeedCategories(product_categories))
})

export const getCategoriesList = cache(async function (
  offset: number = 0,
  limit: number = 100
) {
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { limit, offset },
    { next: { tags: ["categories"] } }
  )
    .then((response) => ({
      ...response,
      product_categories: removeSeedCategories(response.product_categories),
    }))
})

export const getCategoryByHandle = cache(async function (
  categoryHandle: string[]
) {

  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { handle: categoryHandle },
    { next: { tags: ["categories"] } }
  )
    .then((response) => ({
      ...response,
      product_categories: removeSeedCategories(response.product_categories),
    }))
})
