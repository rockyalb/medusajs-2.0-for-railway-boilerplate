import { Heading } from "@medusajs/ui"
import { cookies } from "next/headers"

import OrderSummary from "@modules/order/components/order-summary"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
  const isOnboarding =
    (await cookies()).get("_medusa_onboarding")?.value === "true"

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
        Math.round(((rewardBase * loyaltySettings.percentage) / 100) * 100) /
        100
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
    <div className="py-8 small:py-12 min-h-[calc(100vh-64px)]">
      <MetaPurchase order={order} />
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-6xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-6 w-full text-yco-charcoal"
          data-testid="order-complete-container"
        >
          <header className="rounded-large border border-pastel-mint/60 bg-pastel-mint-soft/60 p-6 small:p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-pastel-mint-ink">
              Porosia u konfirmua
            </p>
            <Heading
              level="h1"
              className="text-3xl font-bold text-yco-coral small:text-4xl"
            >
              Faleminderit që zgjodhët YCO!
            </Heading>
            <p className="mt-3 text-base leading-relaxed">
              Porosia juaj u vendos me sukses. Kujdesi për veten është një hap
              më afër.
            </p>
            <div className="mt-6 border-t border-pastel-mint/60 pt-5">
              <OrderDetails order={order} />
            </div>
            <p className="mt-4 text-sm text-yco-charcoal">
              Nuk e gjeni email-in e konfirmimit? Kontrolloni edhe dosjen
              Spam/Junk.
            </p>
          </header>
          <div className="grid items-start gap-6 small:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <section className="min-w-0 rounded-large border border-white/60 bg-white/40 p-5 small:p-6">
              <Heading level="h2" className="mb-4 text-xl font-bold">
                Produktet tuaja
              </Heading>
              <Items items={order.items} />
            </section>
            <aside className="min-w-0 rounded-large border border-white/60 bg-white/40 p-5 small:p-6">
              <OrderSummary order={order} />
              {loyaltyCreditNotice}
            </aside>
          </div>
          <section className="rounded-large border border-white/60 bg-white/30 p-5 small:p-6">
            <ShippingDetails order={order} />
            <PaymentDetails order={order} />
          </section>
          <div className="flex flex-col gap-5 border-t border-yco-cream-dark pt-2 small:flex-row small:items-center small:justify-between">
            <Help />
            <LocalizedClientLink href="/store" className="yco-btn yco-btn--ink">
              Vazhdo blerjet
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
