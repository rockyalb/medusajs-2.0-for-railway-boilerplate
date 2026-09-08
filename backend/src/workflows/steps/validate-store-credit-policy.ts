import { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { maximumStoreCredit } from "../../lib/store-credit-policy"

type Input = { cart_id: string; customer_id?: string; amount?: number; completing?: boolean }

export async function validateStoreCreditPolicy(input: Input, container: MedusaContainer) {
  const query = container.resolve("query")
  const { data: [cart] } = await query.graph({
    entity: "cart", filters: { id: input.cart_id },
    fields: ["id", "customer_id", "currency_code", "item_total", "credit_lines.*"],
  }, { throwIfKeyNotFound: true })
  const lines = (cart.credit_lines ?? []).filter((line) => line.reference === "store-credit")
  if (input.completing && !lines.length) return 0
  if (!cart.customer_id || (!input.completing && cart.customer_id !== input.customer_id)) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Kjo shportë nuk i përket llogarisë suaj.")
  }
  const { data: [account] } = await query.graph({
    entity: "store_credit_account",
    filters: { customer_id: cart.customer_id, currency_code: cart.currency_code },
    fields: ["id", "balance"],
  })
  const maximum = maximumStoreCredit(Number(account?.balance ?? 0), Number(cart.item_total), cart.currency_code)
  const amount = input.completing
    ? lines.reduce((sum, line) => sum + Number(line.amount), 0)
    : input.amount ?? maximum
  if (input.completing && lines.some((line) => line.reference_id !== account?.id)) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Krediti nuk i përket llogarisë suaj.")
  }
  if (maximum <= 0 || !Number.isFinite(amount) || amount <= 0 || amount > maximum) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA,
      "Krediti përdoret kur bilanci arrin 500 ALL, deri në 25% të vlerës së produkteve me TVSH, pa transport. Riaplikoni kredinë pas ndryshimit të shportës.")
  }
  return amount
}

export const validateStoreCreditPolicyStep = createStep("validate-yco-store-credit-policy", async (input: Input, { container }) => {
  return new StepResponse(await validateStoreCreditPolicy(input, container))
})
