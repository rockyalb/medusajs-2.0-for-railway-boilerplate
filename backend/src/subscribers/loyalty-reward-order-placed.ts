import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { issueLoyaltyRewardWorkflow } from "../workflows/issue-loyalty-reward"

export default async function loyaltyRewardOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await issueLoyaltyRewardWorkflow(container).run({
      input: {
        order_id: data.id,
      },
    })
  } catch (error) {
    console.error("Error issuing loyalty reward:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
