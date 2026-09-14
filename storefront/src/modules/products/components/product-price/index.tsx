"use client"

import { clx } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import DiscountBadge from "../product-card/discount-badge"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
  compact = false,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  compact?: boolean
}) {
  const [badgeTarget, setBadgeTarget] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setBadgeTarget(document.getElementById(`product-image-discount-${product.id}`))
  }, [product.id])

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return (
      <div className="block w-32 max-w-full h-9 bg-gray-100 animate-pulse" />
    )
  }

  return (
    <div
      className={clx(
        "flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-yco-charcoal",
        compact && "justify-start text-left"
      )}
    >
      <span
        className={clx(
          "min-w-0 break-words font-hanken font-bold tracking-tight",
          compact
            ? "text-lg leading-tight xsmall:text-xl"
            : "text-xl leading-none"
        )}
      >
        {!variant && "Nga "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <>
          <span
            className="font-sans text-xs text-yco-charcoal-muted line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
          {badgeTarget && createPortal(
            <DiscountBadge percentage={selectedPrice.percentage_diff} gallery />,
            badgeTarget
          )}
        </>
      )}
    </div>
  )
}
