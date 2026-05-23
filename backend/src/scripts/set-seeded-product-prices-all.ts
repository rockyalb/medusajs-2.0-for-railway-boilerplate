import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

const SEEDED_VARIANT_SKUS = [
  "SHIRT-S-BLACK",
  "SHIRT-S-WHITE",
  "SHIRT-M-BLACK",
  "SHIRT-M-WHITE",
  "SHIRT-L-BLACK",
  "SHIRT-L-WHITE",
  "SHIRT-XL-BLACK",
  "SHIRT-XL-WHITE",
  "SWEATSHIRT-S",
  "SWEATSHIRT-M",
  "SWEATSHIRT-L",
  "SWEATSHIRT-XL",
  "SWEATPANTS-S",
  "SWEATPANTS-M",
  "SWEATPANTS-L",
  "SWEATPANTS-XL",
  "SHORTS-S",
  "SHORTS-M",
  "SHORTS-L",
  "SHORTS-XL",
]

const SEEDED_PRODUCT_PRICE_ALL = 1000

export default async function setSeededProductPricesAll({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const cartModuleService = container.resolve(Modules.CART)
  const pricingModuleService = container.resolve(Modules.PRICING)
  const regionModuleService = container.resolve(Modules.REGION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "sku",
      "price_set.id",
      "price_set.prices.id",
      "price_set.prices.amount",
      "price_set.prices.currency_code",
    ],
    filters: {
      sku: SEEDED_VARIANT_SKUS,
    },
  })

  const missingSkus = SEEDED_VARIANT_SKUS.filter(
    (sku) => !variants.some((variant) => variant.sku === sku)
  )

  if (missingSkus.length) {
    logger.warn(
      `Skipping ${missingSkus.length} seeded variants that were not found: ${missingSkus.join(
        ", "
      )}`
    )
  }

  if (!variants.length) {
    logger.warn("No seeded product variants found. Nothing to update.")
    return
  }

  const priceIdsToRemove: string[] = []
  let updatedCount = 0

  for (const variant of variants) {
    const priceSetId = variant.price_set?.id

    if (!priceSetId) {
      logger.warn(`Variant ${variant.sku} has no price set. Skipping.`)
      continue
    }

    const existingPrices = variant.price_set?.prices ?? []
    const allPrice = existingPrices.find(
      (price) => price.currency_code === "all"
    )

    if (allPrice) {
      await pricingModuleService.updatePriceSets(priceSetId, {
        prices: [
          {
            id: allPrice.id,
            amount: SEEDED_PRODUCT_PRICE_ALL,
            currency_code: "all",
          },
        ],
      })
    } else {
      await pricingModuleService.addPrices({
        priceSetId,
        prices: [
          {
            amount: SEEDED_PRODUCT_PRICE_ALL,
            currency_code: "all",
          },
        ],
      })
    }

    priceIdsToRemove.push(
      ...existingPrices
        .filter((price) => ["eur", "usd"].includes(price.currency_code))
        .map((price) => price.id)
    )
    updatedCount += 1
  }

  if (priceIdsToRemove.length) {
    await pricingModuleService.removePrices(priceIdsToRemove)
  }

  const [albaniaRegion] = await regionModuleService.listRegions({
    name: "Albania",
  })

  if (albaniaRegion) {
    const carts = await cartModuleService.listCarts(
      {},
      {
        select: ["id", "currency_code", "region_id"],
        take: 1000,
      }
    )
    const staleCarts = carts.filter((cart) => cart.currency_code !== "all")

    if (staleCarts.length) {
      await cartModuleService.updateCarts(
        staleCarts.map((cart) => ({
          id: cart.id,
          currency_code: "all",
          region_id: albaniaRegion.id,
        }))
      )
    }

    logger.info(`Updated ${staleCarts.length} stale carts to ALL.`)
  }

  logger.info(`Updated ${updatedCount} seeded product variant prices to ALL.`)
}
