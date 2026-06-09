import { Metadata } from "next"
import { notFound } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Checkout",
}

export const dynamic = "force-dynamic"

const fetchCart = async () => {
  const cart = await retrieveCart()
  if (!cart) {
    return notFound()
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

export default async function Checkout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const cart = await fetchCart()
  const customer = await getCustomer()

  return (
    <div className="content-container grid grid-cols-1 gap-8 py-10 small:grid-cols-[1fr_416px] small:gap-10 small:py-12">
      <Wrapper cart={cart}>
        <CheckoutForm
          cart={cart}
          customer={customer}
          countryCode={countryCode}
        />
      </Wrapper>
      <CheckoutSummary cart={cart} customer={customer} />
    </div>
  )
}
