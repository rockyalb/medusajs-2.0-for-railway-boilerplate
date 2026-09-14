"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect } from "react"

import { trackPostHogEventOnce } from "@lib/posthog"

type PostHogPurchaseProps = {
  order: HttpTypes.StoreOrder
}

/**
 * Records the confirmed order. This cannot be captured from the checkout
 * submit handler: a successful placeOrder() redirects on the server, so the
 * browser never resumes after the call. The confirmation page is the first
 * client render that proves the order exists, so the conversion is captured
 * here and deduplicated by order id against reloads and later revisits.
 */
export default function PostHogPurchase({ order }: PostHogPurchaseProps) {
  useEffect(() => {
    const items = order.items ?? []

    trackPostHogEventOnce(`order_completed:${order.id}`, "order_completed", {
      order_id: order.id,
      order_display_id: order.display_id,
      currency: order.currency_code?.toUpperCase(),
      value: order.total,
      subtotal: order.subtotal,
      shipping_total: order.shipping_total,
      item_count: items.reduce((count, item) => count + (item.quantity ?? 0), 0),
      product_ids: items.map((item) => item.product_id).filter(Boolean),
      variant_ids: items.map((item) => item.variant_id).filter(Boolean),
    })
  }, [order])

  return null
}
