"use server"

import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { getAuthHeaders } from "./cookies"

export const retrieveOrder = cache(async function (id: string) {
  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      query: { fields: "*payment_collections.payments,+metadata" },
      cache: "no-store",
      headers: { ...(await getAuthHeaders()) },
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0
) {
  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>("/store/orders", {
      query: { limit, offset },
      cache: "no-store",
      headers: { ...(await getAuthHeaders()) },
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
})
