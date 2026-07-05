import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { syncProductSearchAndCache } from "../lib/product-search-sync"
import { resolveProductIdFromEvent } from "../lib/product-event-target"

type ImageEventData = {
  id?: string
  product_id?: string
  productId?: string
}

export default async function productImageSearchSyncHandler({
  event,
  container,
}: SubscriberArgs<ImageEventData>) {
  const productId = await resolveProductIdFromEvent(
    container,
    event.data || {},
    "image"
  )

  if (!productId) {
    console.warn(`Product image search sync skipped: no product id for ${event.name}`)
    return
  }

  try {
    await syncProductSearchAndCache(container, productId)
  } catch (error) {
    console.error(`Product image search sync failed for ${productId}`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "product-image.created",
    "product-image.updated",
    "product-image.deleted",
    "product.product-image.created",
    "product.product-image.updated",
    "product.product-image.deleted",
  ],
}
