import { StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

const ALBANIA_STOCK_LOCATION_NAME = "Albania Warehouse"

type VariantInventoryLink = {
  variant_id: string
  inventory_item_id: string
}

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    const initialStock = additional_data?.yco_initial_stock

    if (!Array.isArray(initialStock)) {
      return new StepResponse([], [])
    }

    const quantities = initialStock.map((quantity) => Number(quantity))
    const variants = products.flatMap((product) => product.variants || [])
    const managedVariants = variants
      .map((variant, index) => ({
        id: variant.id,
        manage_inventory: variant.manage_inventory,
        stocked_quantity: quantities[index],
      }))
      .filter(
        (variant) =>
          variant.manage_inventory &&
          Number.isInteger(variant.stocked_quantity) &&
          variant.stocked_quantity >= 0
      )

    if (!managedVariants.length) {
      return new StepResponse([], [])
    }

    const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
    const [albaniaLocation] = await stockLocationService.listStockLocations(
      { name: ALBANIA_STOCK_LOCATION_NAME },
      { select: ["id"], take: 1 }
    )

    if (!albaniaLocation) {
      throw new Error(
        `Stock location "${ALBANIA_STOCK_LOCATION_NAME}" was not found.`
      )
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: inventoryLinks } = await query.graph({
      entity: "product_variant_inventory_item",
      fields: ["variant_id", "inventory_item_id"],
      filters: {
        variant_id: managedVariants.map((variant) => variant.id),
      },
    })
    const inventoryItemIdByVariantId = new Map(
      (inventoryLinks as VariantInventoryLink[]).map((link) => [
        link.variant_id,
        link.inventory_item_id,
      ])
    )

    const inventoryLevels = managedVariants.map((variant) => {
      const inventoryItemId = inventoryItemIdByVariantId.get(variant.id)

      if (!inventoryItemId) {
        throw new Error(
          `No inventory item was created for product variant ${variant.id}.`
        )
      }

      return {
        inventory_item_id: inventoryItemId,
        location_id: albaniaLocation.id,
        stocked_quantity: variant.stocked_quantity,
      }
    })

    const inventoryService = container.resolve(Modules.INVENTORY)
    const createdLevels = await inventoryService.createInventoryLevels(
      inventoryLevels
    )

    return new StepResponse(
      createdLevels,
      createdLevels.map((level) => level.id)
    )
  },
  async (inventoryLevelIds, { container }) => {
    if (!inventoryLevelIds?.length) {
      return
    }

    const inventoryService = container.resolve(Modules.INVENTORY)
    await inventoryService.deleteInventoryLevels(inventoryLevelIds)
  }
)
