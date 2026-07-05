import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { syncProductSearchAndCache } from "../lib/product-search-sync"
import { resolveProductIdFromEvent } from "../lib/product-event-target"

type ProductEventData = {
  id?: string
  product_id?: string
  productId?: string
}

export default async function productSearchSyncHandler({
  event,
  container,
}: SubscriberArgs<ProductEventData>) {
  const productId = await resolveProductIdFromEvent(
    container,
    event.data || {},
    "product"
  )

  if (!productId) {
    console.warn(`Product search sync skipped: no product id for ${event.name}`)
    return
  }

  try {
    await syncProductSearchAndCache(container, productId)
  } catch (error) {
    console.error(`Product search sync failed for ${productId}`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product.product.created",
    "product.product.updated",
    "product.product.deleted",
  ],
}
