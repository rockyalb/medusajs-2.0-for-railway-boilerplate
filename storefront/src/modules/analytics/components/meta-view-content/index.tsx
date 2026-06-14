"use client"

import { useEffect } from "react"

import { buildMetaContents, trackMetaEvent } from "@lib/meta-pixel"

type MetaViewContentProps = {
  productId: string
  variantId?: string | null
  title?: string | null
  value?: number | null
  currency?: string | null
}

export default function MetaViewContent({
  productId,
  variantId,
  title,
  value,
  currency,
}: MetaViewContentProps) {
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_ids: [variantId ?? productId],
      content_name: title,
      content_type: "product",
      contents: buildMetaContents([
        {
          id: variantId ?? productId,
          item_price: value,
          quantity: 1,
        },
      ]),
      currency: currency?.toUpperCase(),
      value,
    })
  }, [currency, productId, title, value, variantId])

  return null
}
