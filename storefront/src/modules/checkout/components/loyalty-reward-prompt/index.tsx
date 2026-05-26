import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LoyaltyRewardPromptProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  percentage: number
  isEnabled: boolean
  isActive: boolean
  endDate?: string | null
  countryCode: string
}

const LoyaltyRewardPrompt = ({
  cart,
  customer,
  percentage,
  isEnabled,
  isActive,
  endDate,
  countryCode,
}: LoyaltyRewardPromptProps) => {
  if (!isEnabled || !isActive || percentage <= 0) {
    return null
  }

  const rewardBase = cart.item_total ?? cart.subtotal ?? 0
  const estimatedReward =
    Math.round(((rewardBase * percentage) / 100) * 100) / 100
  const formattedReward = convertToLocale({
    amount: estimatedReward,
    currency_code: cart.currency_code,
  })
  const formattedEndDate = endDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(endDate))
    : null

  return (
    <div className="border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
      <div className="flex flex-col gap-y-3 small:flex-row small:items-center small:justify-between small:gap-x-6">
        <div>
          <Text size="small" leading="compact" weight="plus">
            Earn {percentage}% back in store credit
          </Text>
          <Text
            size="small"
            leading="compact"
            className="text-ui-fg-subtle mt-1"
          >
            {customer
              ? `This order can add about ${formattedReward} to your account after checkout.`
              : `Create an account or sign in before checkout to get about ${formattedReward} back.`}
            {formattedEndDate ? ` Campaign ends ${formattedEndDate}.` : ""}
          </Text>
        </div>
        {!customer && (
          <LocalizedClientLink
            href={`/account?returnTo=/${countryCode}/checkout`}
          >
            <Button variant="secondary" className="h-10 w-full small:w-auto">
              Sign in
            </Button>
          </LocalizedClientLink>
        )}
      </div>
    </div>
  )
}

export default LoyaltyRewardPrompt
