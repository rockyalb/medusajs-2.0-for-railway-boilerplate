import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
  updateInventoryLevelsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

const STOCK_LOCATION_NAME = "Albania Warehouse"
const BATCH_SIZE = 100

type ImportedVariant = {
  id: string
  title?: string | null
  sku?: string | null
  manage_inventory?: boolean
  metadata?: Record<string, unknown> | null
  inventory_items?: {
    inventory_item_id?: string
    inventory?: {
      id?: string
    }
  }[]
}

function getWooStockQuantity(variant: ImportedVariant): number | null {
  const metadata = variant.metadata || {}
  const rawQuantity = metadata.woocommerce_stock_quantity
  const managesStock = metadata.woocommerce_manage_stock === true

  if (rawQuantity === undefined || rawQuantity === null) {
    return managesStock ? 0 : null
  }

  const parsed = Number(rawQuantity)
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : null
}

function getInventoryItemId(variant: ImportedVariant): string | undefined {
  const link = variant.inventory_items?.[0]

  return link?.inventory_item_id || link?.inventory?.id
}

async function getDefaultStockLocationId(container: ExecArgs["container"]) {
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
  const [namedLocation] = await stockLocationModuleService.listStockLocations({
    name: STOCK_LOCATION_NAME,
  })

  if (namedLocation) {
    return namedLocation.id
  }

  const [firstLocation] = await stockLocationModuleService.listStockLocations(
    {},
    {
      select: ["id"],
      take: 1,
    }
  )

  if (!firstLocation) {
    throw new Error(
      `No stock location found. Run setup-all-shipping.ts before repairing inventory.`
    )
  }

  return firstLocation.id
}

export default async function repairWooCommerceInventory({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const inventoryModuleService = container.resolve(Modules.INVENTORY)
  const locationId = await getDefaultStockLocationId(container)

  let skip = 0
  let scanned = 0
  let managed = 0
  let createdItems = 0
  let createdLevels = 0
  let updatedLevels = 0

  logger.info(`Repairing WooCommerce inventory at stock location ${locationId}...`)

  while (true) {
    const variants = (await productModuleService.listProductVariants(
      {},
      {
        select: [
          "id",
          "title",
          "sku",
          "manage_inventory",
          "metadata",
        ],
        skip,
        take: BATCH_SIZE,
      }
    )) as ImportedVariant[]

    if (!variants.length) {
      break
    }

    const { data: inventoryLinks } = await query.graph({
      entity: "product_variant_inventory_item",
      filters: {
        variant_id: variants.map((variant) => variant.id),
      },
      fields: ["variant_id", "inventory_item_id"],
    })
    const inventoryItemIdByVariantId = new Map(
      inventoryLinks.map((link: any) => [
        link.variant_id,
        link.inventory_item_id,
      ])
    )

    for (const variant of variants) {
      scanned += 1

      const stockedQuantity = getWooStockQuantity(variant)

      if (stockedQuantity === null) {
        continue
      }

      if (!variant.manage_inventory) {
        await updateProductVariantsWorkflow(container).run({
          input: {
            product_variants: [
              {
                id: variant.id,
                manage_inventory: true,
              },
            ],
          },
        })
        managed += 1
      }

      let inventoryItemId =
        inventoryItemIdByVariantId.get(variant.id) || getInventoryItemId(variant)

      if (!inventoryItemId) {
        const { result } = await createInventoryItemsWorkflow(container).run({
          input: {
            items: [
              {
                sku: variant.sku || undefined,
                title: variant.title || variant.sku || variant.id,
                description: variant.title || variant.sku || variant.id,
                requires_shipping: true,
                location_levels: [
                  {
                    location_id: locationId,
                    stocked_quantity: stockedQuantity,
                  },
                ],
              },
            ],
          },
        })

        inventoryItemId = result[0].id
        await link.create({
          [Modules.PRODUCT]: {
            variant_id: variant.id,
          },
          [Modules.INVENTORY]: {
            inventory_item_id: inventoryItemId,
          },
        })
        createdItems += 1
        createdLevels += 1
        continue
      }

      const [existingLevel] = await inventoryModuleService.listInventoryLevels(
        {
          inventory_item_id: inventoryItemId,
          location_id: locationId,
        },
        {
          select: ["id"],
          take: 1,
        }
      )

      if (existingLevel) {
        await updateInventoryLevelsWorkflow(container).run({
          input: {
            updates: [
              {
                inventory_item_id: inventoryItemId,
                location_id: locationId,
                stocked_quantity: stockedQuantity,
              },
            ],
          },
        })
        updatedLevels += 1
      } else {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [
              {
                inventory_item_id: inventoryItemId,
                location_id: locationId,
                stocked_quantity: stockedQuantity,
              },
            ],
          },
        })
        createdLevels += 1
      }
    }

    skip += variants.length
  }

  logger.info(
    `WooCommerce inventory repair complete. Scanned: ${scanned}, variants set to managed: ${managed}, inventory items created: ${createdItems}, levels created: ${createdLevels}, levels updated: ${updatedLevels}.`
  )
}
