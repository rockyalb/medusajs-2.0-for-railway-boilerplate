import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { applyStoreCreditWorkflow } from "../../../../../workflows/apply-store-credit"

// The loyalty plugin supplies authentication and body/query validation middleware.
export async function POST(req: AuthenticatedMedusaRequest<{ amount?: number }>, res: MedusaResponse) {
  await applyStoreCreditWorkflow(req.scope).run({ input: {
    cart_id: req.params.id, customer_id: req.auth_context.actor_id, amount: req.validatedBody.amount,
  } })
  const { data: [cart] } = await req.scope.resolve("query").graph({
    entity: "cart", filters: { id: req.params.id }, fields: req.queryConfig.fields,
  })
  res.json({ cart })
}
