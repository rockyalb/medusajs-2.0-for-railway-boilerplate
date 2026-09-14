import { sdk } from "@lib/config"
import { cache } from "react"

// Shipping actions
export const listCartShippingMethods = cache(async function (cartId: string) {
  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId }, { cache: "no-store" } as any)
    .then(({ shipping_options }) => shipping_options)
    .catch((error) => {
      console.error("Failed to list cart shipping options", error)
      return null
    })
})
