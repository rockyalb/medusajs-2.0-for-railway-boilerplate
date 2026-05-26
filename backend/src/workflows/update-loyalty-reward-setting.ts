import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { upsertLoyaltyRewardSettingStep } from "./steps/upsert-loyalty-reward-setting"

export type UpdateLoyaltyRewardSettingWorkflowInput = {
  percentage: number
  is_enabled: boolean
  start_date?: string | null
  end_date?: string | null
}

export const updateLoyaltyRewardSettingWorkflow = createWorkflow(
  "update-loyalty-reward-setting",
  function (input: UpdateLoyaltyRewardSettingWorkflowInput) {
    const setting = upsertLoyaltyRewardSettingStep(input)

    return new WorkflowResponse(setting)
  }
)
