"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  pendingLabel?: string
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    credit_line_total?: number | null
    currency_code: string
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, pendingLabel }) => {
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    shipping_total,
    discount_total,
    gift_card_total,
    credit_line_total,
  } = totals

  const appliedCredit = credit_line_total ?? gift_card_total ?? 0

  return (
    <div>
      <div className="flex flex-col gap-y-3 text-sm font-medium text-yco-charcoal">
        <div className="flex items-start justify-between gap-4">
          <span className="flex gap-x-1 items-center">
            Nëntotali (pa TVSH, pa transport)
          </span>
          <span data-testid="cart-subtotal" data-value={subtotal || 0}>
            {convertToLocale({ amount: subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_total && (
          <div className="flex items-start justify-between gap-4">
            <span>Zbritja</span>
            <span
              className="font-bold text-pastel-mint-ink"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <span>Transporti</span>
          <span
            data-testid="cart-shipping"
            data-value={pendingLabel ? undefined : shipping_total || 0}
          >
            {pendingLabel ??
              convertToLocale({ amount: shipping_total ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">TVSH</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
        {!!appliedCredit && (
          <div className="flex items-start justify-between gap-4">
            <span>Kredit / kartë dhuratë</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-gift-card-amount"
              data-value={appliedCredit || 0}
            >
              - {convertToLocale({ amount: appliedCredit, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="my-4 h-px w-full border-b border-yco-cream-dark" />
      <div className="mb-2 flex items-start justify-between gap-4 text-yco-charcoal">
        <span className="font-bold uppercase tracking-[0.12em]">Totali</span>
        <span
          className="text-xl font-black whitespace-nowrap"
          data-testid="cart-total"
          data-value={pendingLabel ? undefined : total || 0}
        >
          {pendingLabel ??
            convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="mt-4 h-px w-full border-b border-yco-cream-dark" />
    </div>
  )
}

export default CartTotals
