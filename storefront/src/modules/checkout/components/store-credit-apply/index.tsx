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
  const [error, setError] = useState<string | null>(null)

  if (balance <= 0 || cartTotal <= 0) return null

  const applyAmount =
    currency_code.toLowerCase() === "all" && balance >= 500
      ? Math.floor(Math.min(balance, cartTotal * 0.25) * 100) / 100
      : 0
  const formattedBalance = convertToLocale({ amount: balance, currency_code })
  const formattedApply = convertToLocale({ amount: applyAmount, currency_code })

  const handleApply = () => {
    startTransition(async () => {
      setError(null)
      const result = await applyStoreCreditToCart(cartId, applyAmount)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-3 items-center justify-between py-3 border-t border-gray-200 mt-2">
      <div className="flex flex-col gap-y-0.5">
        <Text size="small" weight="plus">
          Kredit dyqani
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          {formattedBalance} në dispozicion
        </Text>
      </div>
      <Button
        variant="secondary"
        size="small"
        onClick={handleApply}
        isLoading={isPending}
        disabled={applyAmount <= 0 || isPending}
      >
        Apliko {formattedApply}
      </Button>
      {error && (
        <p role="alert" className="w-full text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export default StoreCreditApply
