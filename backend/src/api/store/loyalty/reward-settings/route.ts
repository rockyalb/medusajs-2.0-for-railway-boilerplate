import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_SETTINGS_MODULE } from "../../../../modules/loyalty-settings"
import {
  DEFAULT_LOYALTY_REWARD_PERCENTAGE,
  DEFAULT_LOYALTY_REWARD_SETTING_KEY,
} from "../../../../workflows/steps/upsert-loyalty-reward-setting"

const isCampaignActive = (setting: any) => {
  if (setting?.is_enabled === false) {
    return false
  }

  const now = Date.now()
  const start = setting?.start_date ? new Date(setting.start_date).getTime() : null
  const end = setting?.end_date ? new Date(setting.end_date).getTime() : null

  if (start && now < start) {
    return false
  }

  if (end && now > end) {
    return false
  }

  return true
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const loyaltySettingsService = req.scope.resolve(
    LOYALTY_SETTINGS_MODULE
  ) as any
  const [setting] =
    await loyaltySettingsService.listLoyaltyRewardSettings({
      key: DEFAULT_LOYALTY_REWARD_SETTING_KEY,
    })

  res.json({
    reward_setting: {
      percentage: setting?.percentage ?? DEFAULT_LOYALTY_REWARD_PERCENTAGE,
      is_enabled: setting?.is_enabled ?? true,
      is_active: isCampaignActive(setting),
      start_date: setting?.start_date ?? null,
      end_date: setting?.end_date ?? null,
    },
  })
}
