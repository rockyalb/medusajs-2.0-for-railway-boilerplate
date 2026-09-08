import { Heading } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import StoreCreditApply from "@modules/checkout/components/store-credit-apply"
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

    if (creditBalance > 0) {
      storeCreditApply = (
        <StoreCreditApply
          cartId={cart.id}
          cartTotal={cart.item_total ?? 0}
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
    <>
      <Heading level="h2" className="text-3xl-regular mb-4">
        Në shportën tuaj
      </Heading>
      <ItemsPreviewTemplate items={cart?.items} />
      <div className="my-4">
        <DiscountCode cart={cart} />
      </div>
      <FreeShippingProgress
        item_total={cart.item_total}
        subtotal={cart.subtotal}
        tax_total={cart.tax_total}
        currency_code={cart.currency_code}
        compact
      />
      {storeCreditApply}
      {loyaltyCreditNotice}
    </>
  )
}

export default CheckoutSummary
