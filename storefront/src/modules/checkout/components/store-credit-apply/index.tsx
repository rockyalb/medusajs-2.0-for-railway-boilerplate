"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button, Text } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"
import { applyStoreCreditToCart } from "@lib/data/loyalty"

type Props = {
  cartId: string
  cartTotal: number
  balance: number
  currency_code: string
}

const StoreCreditApply = ({
  cartId,
  cartTotal,
  balance,
  currency_code,
}: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [applied, setApplied] = useState(false)

  if (applied || balance <= 0 || cartTotal <= 0) return null

  const applyAmount = Math.min(balance, cartTotal)
  const formattedBalance = convertToLocale({ amount: balance, currency_code })
  const formattedApply = convertToLocale({ amount: applyAmount, currency_code })

  const handleApply = () => {
    startTransition(async () => {
      await applyStoreCreditToCart(cartId, applyAmount)
      setApplied(true)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-between py-3 border-t border-gray-200 mt-2">
      <div className="flex flex-col gap-y-0.5">
        <Text size="small" weight="plus">
          Store Credit
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          {formattedBalance} available
        </Text>
      </div>
      <Button
        variant="secondary"
        size="small"
        onClick={handleApply}
        isLoading={isPending}
      >
        Apply {formattedApply}
      </Button>
    </div>
  )
}

export default StoreCreditApply
