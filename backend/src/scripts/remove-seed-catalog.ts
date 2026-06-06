import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import {
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
} from "@medusajs/core-flows"

const SEEDED_PRODUCTS = [
  { handle: "t-shirt", title: "Medusa T-Shirt" },
  { handle: "sweatshirt", title: "Medusa Sweatshirt" },
  { handle: "sweatpants", title: "Medusa Sweatpants" },
  { handle: "shorts", title: "Medusa Shorts" },
]

const SEEDED_CATEGORIES = [
  { handle: "shirts", name: "Shirts" },
  { handle: "sweatshirts", name: "Sweatshirts" },
  { handle: "pants", name: "Pants" },
  { handle: "merch", name: "Merch" },
]

export default async function removeSeedCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title"],
    filters: {
      handle: SEEDED_PRODUCTS.map((product) => product.handle),
    },
  })

  const productIds = products
    .filter((product) =>
      SEEDED_PRODUCTS.some(
        (seededProduct) =>
          seededProduct.handle === product.handle &&
          seededProduct.title === product.title
      )
    )
    .map((product) => product.id)

  if (productIds.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: productIds.map((id) => ({
          id,
          status: ProductStatus.DRAFT,
        })),
      },
    })
    logger.info(`Unpublished ${productIds.length} seeded products.`)
  } else {
    logger.info("No seeded products found.")
  }

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
    filters: {
      handle: SEEDED_CATEGORIES.map((category) => category.handle),
    },
  })

  const categoryIds = categories
    .filter((category) =>
      SEEDED_CATEGORIES.some(
        (seededCategory) =>
          seededCategory.handle === category.handle &&
          seededCategory.name === category.name
      )
    )
    .map((category) => category.id)

  if (categoryIds.length) {
    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: {
          id: categoryIds,
        },
        update: {
          is_active: false,
        },
      },
    })
    logger.info(`Deactivated ${categoryIds.length} seeded categories.`)
  } else {
    logger.info("No seeded categories found.")
  }
}
