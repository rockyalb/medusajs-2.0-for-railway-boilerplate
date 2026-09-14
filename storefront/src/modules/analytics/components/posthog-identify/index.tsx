"use client"

import type { HttpTypes } from "@medusajs/types"
import { useEffect } from "react"

import { identifyPostHogCustomer } from "@lib/posthog"

/**
 * Ties the anonymous browser session to the signed-in customer. Mounted from
 * the shared layouts so a returning authenticated visitor is identified on the
 * first page load rather than only after visiting the account area.
 */
export default function PostHogIdentify({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) {
  const customerId = customer?.id
  const email = customer?.email
  const firstName = customer?.first_name
  const lastName = customer?.last_name

  useEffect(() => {
    if (!customerId) {
      return
    }

    identifyPostHogCustomer(customerId, {
      ...(email ? { email } : {}),
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
    })
  }, [customerId, email, firstName, lastName])

  return null
}
