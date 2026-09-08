import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { addStoreCreditsToCartWorkflow } from "@medusajs/loyalty-plugin/workflows"
import { validateStoreCreditPolicyStep } from "./steps/validate-store-credit-policy"

export const applyStoreCreditWorkflow = createWorkflow("apply-yco-store-credit", function (input: {
  cart_id: string; customer_id: string; amount?: number
}) {
  const amount = validateStoreCreditPolicyStep(input)
  const result = addStoreCreditsToCartWorkflow.runAsStep({ input: { cart_id: input.cart_id, amount } })
  return new WorkflowResponse(result)
})
