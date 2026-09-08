import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import ContinuousCheckout from "@modules/checkout/components/continuous-checkout"
import { getLoyaltyRewardSetting } from "@lib/data/loyalty"
import { HttpTypes } from "@medusajs/types"
import LoyaltyRewardPrompt from "@modules/checkout/components/loyalty-reward-prompt"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const loyaltyRewardSetting = await getLoyaltyRewardSetting()

  return (
    <div>
      <div className="w-full grid grid-cols-1 gap-y-8">
        <LoyaltyRewardPrompt
          cart={cart}
          customer={customer}
          percentage={loyaltyRewardSetting.percentage}
          isEnabled={loyaltyRewardSetting.is_enabled}
          isActive={loyaltyRewardSetting.is_active}
          endDate={loyaltyRewardSetting.end_date}
        />

        <ContinuousCheckout key={cart.id} cart={cart} customer={customer}>
          <CheckoutSummary cart={cart} customer={customer} />
        </ContinuousCheckout>
      </div>
    </div>
  )
}
