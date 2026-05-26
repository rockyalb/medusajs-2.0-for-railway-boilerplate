"use server"

import { cache } from "react"
import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { getAuthHeaders } from "./cookies"

export type LoyaltyRewardSetting = {
  percentage: number
  is_enabled: boolean
  is_active: boolean
  start_date: string | null
  end_date: string | null
}

export type StoreCreditAccount = {
  id: string
  customer_id?: string
  currency_code: string
  balance: number
  credits: number
  debits: number
  created_at: string
  updated_at: string
}

export async function getLoyaltyRewardSetting() {
  return sdk.client
    .fetch<{ reward_setting: LoyaltyRewardSetting }>(
      "/store/loyalty/reward-settings",
      {
        next: { tags: ["loyalty-reward-setting"] },
      }
    )
    .then(({ reward_setting }) => reward_setting)
    .catch(() => ({
      percentage: 2,
      is_enabled: true,
      is_active: true,
      start_date: null,
      end_date: null,
    }))
}

export const getCustomerStoreCreditAccounts = cache(async function (
  currencyCode: string = "all"
) {
  const authHeaders = await getAuthHeaders()
  return sdk.client
    .fetch<{ store_credit_accounts: StoreCreditAccount[] }>(
      "/store/store-credit-accounts",
      {
        headers: authHeaders as Record<string, string>,
        query: { currency_code: currencyCode },
        cache: "no-store",
      }
    )
    .then(({ store_credit_accounts }) => store_credit_accounts)
    .catch((error) => {
      console.error("Failed to fetch customer store credit accounts", error)
      return [] as StoreCreditAccount[]
    })
})

export async function applyStoreCreditToCart(cartId: string, amount: number) {
  const authHeaders = await getAuthHeaders()
  await sdk.client
    .fetch(`/store/carts/${cartId}/store-credits`, {
      method: "POST",
      body: { amount },
      headers: authHeaders as Record<string, string>,
    })
    .catch(() => null)
  revalidateTag("cart")
}
