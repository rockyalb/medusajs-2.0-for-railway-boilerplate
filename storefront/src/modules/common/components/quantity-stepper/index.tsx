"use client"

import { clx } from "@medusajs/ui"

type QuantityStepperProps = {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
  /** compact = cart drawer rows, base = PDP / forms (44px touch targets) */
  size?: "compact" | "base"
  "data-testid"?: string
}

export default function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 10,
  disabled,
  size = "base",
  "data-testid": dataTestid,
}: QuantityStepperProps) {
  const buttonClasses = clx(
    "grid place-items-center text-yco-charcoal transition-colors hover:bg-yco-panel disabled:cursor-not-allowed disabled:opacity-30 outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-inset",
    size === "compact" ? "h-8 w-8" : "h-11 w-11"
  )

  return (
    <div
      className={clx(
        "inline-flex items-center overflow-hidden rounded-circle border border-yco-cream-dark bg-white",
        disabled && "opacity-60"
      )}
      data-testid={dataTestid}
    >
      <button
        type="button"
        className={buttonClasses}
        onClick={() => onChange(quantity - 1)}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <span
        className={clx(
          "min-w-8 select-none text-center font-sans font-bold text-yco-charcoal",
          size === "compact" ? "text-xs" : "text-sm"
        )}
        aria-live="polite"
        aria-label={`Quantity: ${quantity}`}
      >
        {quantity}
      </span>
      <button
        type="button"
        className={buttonClasses}
        onClick={() => onChange(quantity + 1)}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}
