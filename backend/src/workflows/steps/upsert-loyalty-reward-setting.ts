import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { LOYALTY_SETTINGS_MODULE } from "../../modules/loyalty-settings"

export type LoyaltyRewardSettingDTO = {
  id: string
  key: string
  percentage: number
  is_enabled: boolean
  start_date?: string | Date | null
  end_date?: string | Date | null
}

type UpsertLoyaltyRewardSettingInput = {
  percentage: number
  is_enabled: boolean
  start_date?: string | null
  end_date?: string | null
}

export const DEFAULT_LOYALTY_REWARD_SETTING_KEY = "default"
export const DEFAULT_LOYALTY_REWARD_PERCENTAGE = 2

export const upsertLoyaltyRewardSettingStep = createStep(
  "upsert-loyalty-reward-setting",
  async (input: UpsertLoyaltyRewardSettingInput, { container }) => {
    const loyaltySettingsService = container.resolve(
      LOYALTY_SETTINGS_MODULE
    ) as any
    const [existing] =
      await loyaltySettingsService.listLoyaltyRewardSettings({
        key: DEFAULT_LOYALTY_REWARD_SETTING_KEY,
      })

    const setting = existing
      ? await loyaltySettingsService.updateLoyaltyRewardSettings({
          id: existing.id,
          percentage: input.percentage,
          is_enabled: input.is_enabled,
          start_date: input.start_date ? new Date(input.start_date) : null,
          end_date: input.end_date ? new Date(input.end_date) : null,
        })
      : await loyaltySettingsService.createLoyaltyRewardSettings({
          key: DEFAULT_LOYALTY_REWARD_SETTING_KEY,
          percentage: input.percentage,
          is_enabled: input.is_enabled,
          start_date: input.start_date ? new Date(input.start_date) : null,
          end_date: input.end_date ? new Date(input.end_date) : null,
        })

    return new StepResponse(setting, existing ?? null)
  },
  async (previousSetting, { container }) => {
    const loyaltySettingsService = container.resolve(
      LOYALTY_SETTINGS_MODULE
    ) as any

    if (!previousSetting) {
      await loyaltySettingsService.deleteLoyaltyRewardSettings({
        key: DEFAULT_LOYALTY_REWARD_SETTING_KEY,
      })
      return
    }

    await loyaltySettingsService.updateLoyaltyRewardSettings({
      id: previousSetting.id,
      percentage: previousSetting.percentage,
      is_enabled: previousSetting.is_enabled,
      start_date: previousSetting.start_date ?? null,
      end_date: previousSetting.end_date ?? null,
    })
  }
)
