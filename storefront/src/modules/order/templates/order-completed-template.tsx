import { Heading } from "@medusajs/ui"
import { cookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import LoyaltyCreditNotice from "@modules/common/components/loyalty-credit-notice"
import MetaPurchase from "@modules/analytics/components/meta-purchase"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"
import { getLoyaltyRewardSetting } from "@lib/data/loyalty"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const isOnboarding = (await cookies()).get("_medusa_onboarding")?.value === "true"

  let loyaltyCreditNotice = null

  const customer = await getCustomer().catch(() => null)
  if (customer) {
    const loyaltySettings = await getLoyaltyRewardSetting()
    if (
      loyaltySettings.is_enabled &&
      loyaltySettings.is_active &&
      loyaltySettings.percentage > 0
    ) {
      const rewardBase = order.item_total ?? order.subtotal ?? 0
      const estimatedReward =
        Math.round(
          ((rewardBase * loyaltySettings.percentage) / 100) * 100
        ) / 100
      if (estimatedReward > 0) {
        loyaltyCreditNotice = (
          <LoyaltyCreditNotice
            amount={estimatedReward}
            currency_code={order.currency_code}
            variant="confirmation"
          />
        )
      }
    }
  }

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <MetaPurchase order={order} />
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>Faleminderit!</span>
            <span>Porosia juaj u vendos me sukses.</span>
          </Heading>
          <div className="rounded-large border border-yco-cream-dark bg-yco-panel p-4 text-sm font-medium text-yco-charcoal">
            Email-i i konfirmimit mund të përfundojë në dosjen Spam/Junk.
            Kontrollojeni atje nëse nuk e shihni në kutinë kryesore.
          </div>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Përmbledhje
          </Heading>
          <Items items={order.items} />
          <CartTotals totals={order} />
          {loyaltyCreditNotice}
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
