import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { validateStoreCreditPolicy } from "../steps/validate-store-credit-policy"

// Recheck the current product total before the plugin debits credit or authorizes payment.
completeCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  await validateStoreCreditPolicy({ cart_id: input.id, completing: true }, container)
})
