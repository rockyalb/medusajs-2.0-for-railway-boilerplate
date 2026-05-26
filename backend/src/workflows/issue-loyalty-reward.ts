import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { issueLoyaltyRewardStep } from "./steps/issue-loyalty-reward"

export type IssueLoyaltyRewardWorkflowInput = {
  order_id: string
}

export const issueLoyaltyRewardWorkflow = createWorkflow(
  "issue-loyalty-reward",
  function (input: IssueLoyaltyRewardWorkflowInput) {
    const reward = issueLoyaltyRewardStep(input)

    return new WorkflowResponse(reward)
  }
)
