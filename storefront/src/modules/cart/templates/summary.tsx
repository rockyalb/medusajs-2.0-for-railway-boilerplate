"use client"

import { Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import FreeShippingProgress from "@modules/common/components/free-shipping-progress"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="rhode-display text-4xl">
        Summary
      </Heading>
      <FreeShippingProgress
        item_total={cart.item_total}
        subtotal={cart.subtotal}
        tax_total={cart.tax_total}
        currency_code={cart.currency_code}
      />
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <span className="yco-btn yco-btn--coral yco-btn--block">
          Go to checkout
        </span>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
