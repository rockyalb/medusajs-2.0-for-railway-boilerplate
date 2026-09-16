import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  InventoryEvents,
  PricingEvents,
  ProductEvents,
  ProductCategoryWorkflowEvents,
  ProductCollectionWorkflowEvents,
  ProductOptionWorkflowEvents,
  ProductTagWorkflowEvents,
  ProductTypeWorkflowEvents,
  ProductVariantWorkflowEvents,
  ProductWorkflowEvents,
} from "@medusajs/framework/utils"
import { expireStorefrontProductCache } from "../lib/product-search-sync"

/**
 * Invalidation must not depend on search indexing or resolving a parent product:
 * deleted variants/stock records may already be gone, and inventory can be shared.
 * The catalog uses one products tag, so expire it for every catalog mutation.
 */
export default async function productCacheInvalidationHandler({
  event,
}: SubscriberArgs<unknown>) {
  // The event bus defaults to one attempt. Retry transient storefront failures here.
  for (let attempt = 0; attempt < 3; attempt++) {
    if (await expireStorefrontProductCache()) {
      return
    }
  }

  throw new Error(`Storefront product cache expiry failed for ${event.name}`)
}

export const config: SubscriberConfig = {
  event: Array.from(new Set([
    ...Object.values(ProductEvents),
    ...Object.values(InventoryEvents),
    ...Object.values(PricingEvents),
    // Workflow events run after related prices, inventory links, etc. are saved.
    ...Object.values(ProductWorkflowEvents),
    ...Object.values(ProductVariantWorkflowEvents),
    ...Object.values(ProductCategoryWorkflowEvents),
    ...Object.values(ProductCollectionWorkflowEvents),
    ...Object.values(ProductOptionWorkflowEvents),
    ...Object.values(ProductTagWorkflowEvents),
    ...Object.values(ProductTypeWorkflowEvents),
  ])),
  context: { subscriberId: "storefront-product-cache-invalidation" },
}
