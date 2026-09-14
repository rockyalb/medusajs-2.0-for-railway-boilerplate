import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { cache } from "react"

// Shipping actions
export const listCartPaymentMethods = cache(async function (regionId: string) {
  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      "/store/payment-providers",
      { query: { region_id: regionId }, cache: "no-store", headers: {} }
    )
    .then(({ payment_providers }) => payment_providers)
    .catch(() => {
      return null
    })
})
