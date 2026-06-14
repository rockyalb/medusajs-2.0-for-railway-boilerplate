import { listCartShippingMethods } from "@lib/data/fulfillment"
import { getLoyaltyRewardSetting } from "@lib/data/loyalty"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import LoyaltyRewardPrompt from "@modules/checkout/components/loyalty-reward-prompt"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

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

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")
  const loyaltyRewardSetting = await getLoyaltyRewardSetting()

  if (!shippingMethods || !paymentMethods) {
    return null
  }

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

        <Addresses cart={cart} customer={customer} />

        <Shipping cart={cart} availableShippingMethods={shippingMethods} />

        <Payment cart={cart} availablePaymentMethods={paymentMethods} />

        <Review cart={cart} />
      </div>
    </div>
  )
}
