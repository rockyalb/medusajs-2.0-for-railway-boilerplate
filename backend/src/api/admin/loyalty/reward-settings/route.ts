import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaContainer } from "@medusajs/framework/types"
import { LOYALTY_SETTINGS_MODULE } from "../../../../modules/loyalty-settings"
import {
  DEFAULT_LOYALTY_REWARD_PERCENTAGE,
  DEFAULT_LOYALTY_REWARD_SETTING_KEY,
} from "../../../../workflows/steps/upsert-loyalty-reward-setting"
import {
  UpdateLoyaltyRewardSettingWorkflowInput,
  updateLoyaltyRewardSettingWorkflow,
} from "../../../../workflows/update-loyalty-reward-setting"
import { AdminUpdateLoyaltyRewardSettingType } from "./validators"

const getRewardSetting = async (scope: MedusaContainer) => {
  const loyaltySettingsService = scope.resolve(
    LOYALTY_SETTINGS_MODULE
  ) as any
  const [setting] =
    await loyaltySettingsService.listLoyaltyRewardSettings({
      key: DEFAULT_LOYALTY_REWARD_SETTING_KEY,
    })

  return {
    id: setting?.id ?? null,
    percentage: setting?.percentage ?? DEFAULT_LOYALTY_REWARD_PERCENTAGE,
    is_enabled: setting?.is_enabled ?? true,
    start_date: setting?.start_date ?? null,
    end_date: setting?.end_date ?? null,
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ reward_setting: await getRewardSetting(req.scope) })
}

export async function POST(
  req: MedusaRequest<AdminUpdateLoyaltyRewardSettingType>,
  res: MedusaResponse
) {
  const input: UpdateLoyaltyRewardSettingWorkflowInput = {
    percentage:
      req.validatedBody.percentage ?? DEFAULT_LOYALTY_REWARD_PERCENTAGE,
    is_enabled: req.validatedBody.is_enabled ?? true,
    start_date: req.validatedBody.start_date ?? null,
    end_date: req.validatedBody.end_date ?? null,
  }

  const { result } = await updateLoyaltyRewardSettingWorkflow(req.scope).run({
    input,
  })

  res.json({ reward_setting: result })
}
