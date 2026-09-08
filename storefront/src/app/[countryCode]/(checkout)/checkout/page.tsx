import { Metadata } from "next"
import { notFound } from "next/navigation"

import CheckoutForm from "@modules/checkout/templates/checkout-form"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Përfundo blerjen",
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
    <div className="content-container max-w-3xl py-8 small:py-12">
      <CheckoutForm cart={cart} customer={customer} />
    </div>
  )
}
