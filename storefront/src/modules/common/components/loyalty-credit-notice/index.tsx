import { convertToLocale } from "@lib/util/money"
import { Text } from "@medusajs/ui"

type Props = {
  amount: number
  currency_code: string
  variant: "checkout" | "confirmation"
}

const LoyaltyCreditNotice = ({ amount, currency_code, variant }: Props) => {
  if (amount <= 0) return null

  const formatted = convertToLocale({ amount, currency_code })

  return (
    <div className="flex items-center gap-x-2 bg-ui-bg-subtle border border-ui-border-base px-3 py-2 mt-3">
      <span className="text-ui-fg-interactive text-base">✦</span>
      <Text size="small" className="text-ui-fg-subtle">
        {variant === "checkout"
          ? `You'll earn ~${formatted} in store credit with this order.`
          : `You've earned ~${formatted} in store credit from this order.`}
      </Text>
    </div>
  )
}

export default LoyaltyCreditNotice
