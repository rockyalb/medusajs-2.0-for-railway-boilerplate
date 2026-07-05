import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"

const HANDLES = [
  "calming-superactive",
  "well-being-shampoo",
  "renewing-shampoo",
  "nourishing-hair-royal-jelly-superactive",
  "this-is-an-extra-strong-hair-spray",
  "this-is-a-medium-hold-finishing-gum",
  "well-being-conditioner",
  "energizing-gel",
  "calming-shampoo",
  "this-is-a-texturizing-serum",
  "this-is-a-dry-texturizer",
  "this-is-a-shimmering-mist",
  "purifying-gel",
]

export default async function verifyImageDerivedProductRepairs({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  for (const handle of HANDLES) {
    const { data } = await query.graph({
      entity: "product",
      filters: { handle },
      fields: [
        "id",
        "title",
        "handle",
        "metadata",
        "variants.id",
        "variants.title",
        "variants.price_set.prices.amount",
        "variants.price_set.prices.currency_code",
      ],
      pagination: {
        take: 1,
      }
    })
    const [product] = data

    if (!product) {
      logger.warn(`MISSING ${handle}`)
      continue
    }

    const metadata = product.metadata || {}
    const variants = (product.variants || []).map((variant: any) => ({
      title: variant.title,
      prices: variant.price_set?.prices || [],
    }))

    logger.info(
      JSON.stringify({
        title: product.title,
        handle: product.handle,
        variants,
        has_ingredients: Boolean(metadata.ingredients),
        has_how_to_use: Boolean(metadata.how_to_use),
        previous_handle: metadata.image_derived_repair_previous_handle,
      })
    )
  }
}
