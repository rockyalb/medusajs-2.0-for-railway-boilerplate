import { Heading } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import StoreCreditApply from "@modules/checkout/components/store-credit-apply"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import FreeShippingProgress from "@modules/common/components/free-shipping-progress"
import LoyaltyCreditNotice from "@modules/common/components/loyalty-credit-notice"
import {
  getLoyaltyRewardSetting,
  getCustomerStoreCreditAccounts,
} from "@lib/data/loyalty"

const CheckoutSummary = async ({
  cart,
  customer,
}: {
  cart: any
  customer: HttpTypes.StoreCustomer | null
}) => {
  let storeCreditApply = null
  let loyaltyCreditNotice = null

  if (customer && cart) {
    const [loyaltySettings, creditAccounts] = await Promise.all([
      getLoyaltyRewardSetting(),
      getCustomerStoreCreditAccounts(cart.currency_code),
    ])

    const currencyAccount = creditAccounts.find(
      (a) => a.currency_code === cart.currency_code
    )

    const creditBalance = currencyAccount ? Number(currencyAccount.balance) : 0
    const alreadyApplied = (cart.gift_card_total ?? 0) > 0

    if (creditBalance > 0 && !alreadyApplied) {
      storeCreditApply = (
        <StoreCreditApply
          cartId={cart.id}
          cartTotal={cart.total ?? 0}
          balance={creditBalance}
          currency_code={cart.currency_code}
        />
      )
    }

    if (
      loyaltySettings.is_enabled &&
      loyaltySettings.is_active &&
      loyaltySettings.percentage > 0
    ) {
      const rewardBase = cart.item_total ?? cart.subtotal ?? 0
      const estimatedReward =
        Math.round(((rewardBase * loyaltySettings.percentage) / 100) * 100) /
        100

      if (estimatedReward > 0) {
        loyaltyCreditNotice = (
          <LoyaltyCreditNotice
            amount={estimatedReward}
            currency_code={cart.currency_code}
            variant="checkout"
          />
        )
      }
    }
  }

  return (
    <div className="sticky top-6 flex flex-col-reverse gap-y-8 py-8 small:flex-col small:py-0">
      <div className="flex w-full flex-col rounded-large border border-yco-cream-dark bg-white p-5 small:p-6">
        <Divider className="my-6 small:hidden" />
        <Heading
          level="h2"
          className="rhode-display flex flex-row items-baseline text-4xl"
        >
          Në shportën tuaj
        </Heading>
        <Divider className="my-6" />
        <FreeShippingProgress
          item_total={cart.item_total}
          subtotal={cart.subtotal}
          tax_total={cart.tax_total}
          currency_code={cart.currency_code}
          compact
        />
        <div className="mt-6">
          <CartTotals totals={cart} />
        </div>
        {storeCreditApply}
        {loyaltyCreditNotice}
        <ItemsPreviewTemplate items={cart?.items} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
