import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

const BATCH_SIZE = 100

type Variant = {
  id: string
  manage_inventory?: boolean
  metadata?: Record<string, unknown> | null
  product?: {
    id: string
    title?: string | null
    metadata?: Record<string, unknown> | null
  }
}

function hasWooStockData(variant: Variant) {
  const metadata = variant.metadata || {}

  return (
    metadata.woocommerce_manage_stock === true ||
    metadata.woocommerce_stock_quantity !== undefined &&
      metadata.woocommerce_stock_quantity !== null
  )
}

function getWooType(variant: Variant) {
  return String(variant.product?.metadata?.woocommerce_type || "unknown")
}

export default async function auditWooCommerceInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)

  let skip = 0
  let total = 0
  let withWooStockData = 0
  let managedWithWooStockData = 0
  const byType = new Map<
    string,
    { total: number; stockData: number; managedStockData: number }
  >()

  while (true) {
    const variants = (await productModuleService.listProductVariants(
      {},
      {
        relations: ["product"],
        select: [
          "id",
          "manage_inventory",
          "metadata",
          "product.id",
          "product.title",
          "product.metadata",
        ],
        skip,
        take: BATCH_SIZE,
      }
    )) as Variant[]

    if (!variants.length) {
      break
    }

    for (const variant of variants) {
      const type = getWooType(variant)
      const stats =
        byType.get(type) || { total: 0, stockData: 0, managedStockData: 0 }
      const stockData = hasWooStockData(variant)

      total += 1
      stats.total += 1

      if (stockData) {
        withWooStockData += 1
        stats.stockData += 1
      }

      if (stockData && variant.manage_inventory) {
        managedWithWooStockData += 1
        stats.managedStockData += 1
      }

      byType.set(type, stats)
    }

    skip += variants.length
  }

  logger.info(
    `Woo inventory audit: variants=${total}, variants with Woo stock data=${withWooStockData}, managed variants with Woo stock data=${managedWithWooStockData}.`
  )

  for (const [type, stats] of [...byType.entries()].sort()) {
    logger.info(
      `Woo type ${type}: variants=${stats.total}, stock data=${stats.stockData}, managed stock data=${stats.managedStockData}.`
    )
  }
}
