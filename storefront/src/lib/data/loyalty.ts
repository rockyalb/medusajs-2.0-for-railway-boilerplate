"use server"

import { sdk } from "@lib/config"

export type LoyaltyRewardSetting = {
  percentage: number
  is_enabled: boolean
  is_active: boolean
  start_date: string | null
  end_date: string | null
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
