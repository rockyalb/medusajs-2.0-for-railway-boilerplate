"use client"

import { FREE_SHIPPING_THRESHOLD_ALL } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"

type FreeShippingProgressProps = {
  item_total?: number | null
  subtotal?: number | null
  tax_total?: number | null
  currency_code: string
  compact?: boolean
}

const FreeShippingProgress = ({
  item_total,
  subtotal = 0,
  tax_total = 0,
  currency_code,
  compact = false,
}: FreeShippingProgressProps) => {
  const current = Math.max(0, item_total ?? (subtotal ?? 0) + (tax_total ?? 0))
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD_ALL - current, 0)
  const progress = Math.min((current / FREE_SHIPPING_THRESHOLD_ALL) * 100, 100)
  const hasFreeShipping = remaining <= 0

  return (
    <div
      className={`rounded-large border border-pastel-mint/40 bg-pastel-mint-soft ${
        compact ? "p-4" : "p-5"
      }`}
      aria-live="polite"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="rhode-eyebrow text-pastel-mint-ink">Free shipping</p>
          <p className="mt-1 text-sm font-bold text-yco-charcoal">
            {hasFreeShipping
              ? "You unlocked free delivery."
              : `${convertToLocale({
                  amount: remaining,
                  currency_code,
                  maximumFractionDigits: 0,
                })} away from free delivery`}
          </p>
        </div>
        <span className="shrink-0 rounded-circle bg-white px-3 py-1 text-xs font-bold text-pastel-mint-ink">
          {Math.round(progress)}%
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-circle bg-white"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD_ALL}
        aria-valuenow={Math.min(current, FREE_SHIPPING_THRESHOLD_ALL)}
      >
        <div
          className="h-full rounded-circle bg-pastel-mint transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {!compact && (
        <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-yco-charcoal-muted">
          <span>
            {convertToLocale({
              amount: current,
              currency_code,
              maximumFractionDigits: 0,
            })}
          </span>
          <span>
            {convertToLocale({
              amount: FREE_SHIPPING_THRESHOLD_ALL,
              currency_code,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      )}
    </div>
  )
}

export default FreeShippingProgress
