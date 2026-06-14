"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect } from "react"

import { buildMetaContents, trackMetaEvent } from "@lib/meta-pixel"

type MetaPurchaseProps = {
  order: HttpTypes.StoreOrder
}

export default function MetaPurchase({ order }: MetaPurchaseProps) {
  useEffect(() => {
    const metadata = order.metadata as Record<string, unknown> | null
    const tracking = metadata?.meta_tracking as
      | Record<string, unknown>
      | undefined
    const eventId =
      typeof tracking?.purchase_event_id === "string"
        ? tracking.purchase_event_id
        : `purchase.${order.id}`
    const contents = buildMetaContents(
      (order.items ?? []).map((item) => ({
        id: item.variant_id ?? item.product_id,
        quantity: item.quantity,
        item_price: item.unit_price,
      }))
    )

    trackMetaEvent(
      "Purchase",
      {
        content_ids: contents.map((content) => content.id),
        content_type: "product",
        contents,
        currency: order.currency_code?.toUpperCase(),
        value: order.total,
      },
      { eventID: eventId }
    )
  }, [order])

  return null
}
