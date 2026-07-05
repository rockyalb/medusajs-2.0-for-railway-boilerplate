import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { syncProductSearchAndCache } from "../lib/product-search-sync"
import { resolveProductIdFromEvent } from "../lib/product-event-target"

type VariantEventData = {
  id?: string
  product_id?: string
  productId?: string
}

export default async function productVariantSearchSyncHandler({
  event,
  container,
}: SubscriberArgs<VariantEventData>) {
  const productId = await resolveProductIdFromEvent(
    container,
    event.data || {},
    "variant"
  )

  if (!productId) {
    console.warn(
      `Product variant search sync skipped: no product id for ${event.name}`
    )
    return
  }

  try {
    await syncProductSearchAndCache(container, productId)
  } catch (error) {
    console.error(`Product variant search sync failed for ${productId}`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",
    "product.product-variant.created",
    "product.product-variant.updated",
    "product.product-variant.deleted",
  ],
}
