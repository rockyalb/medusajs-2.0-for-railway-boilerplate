import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const STORE_CREDIT_MODULE = "store_credit"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({ store_credit_accounts: [] })
    return
  }

  const storeCreditService = req.scope.resolve(STORE_CREDIT_MODULE) as any
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: storeCreditAccounts } = await query.graph({
    entity: "store_credit_account",
    fields: [
      "id",
      "currency_code",
      "customer_id",
      "created_at",
      "updated_at",
      "metadata",
    ],
    filters: {
      customer_id: customerId,
    },
  })

  const accountsWithStats = await Promise.all(
    storeCreditAccounts.map(async (account) => {
      const accountStats = await storeCreditService.retrieveAccountStats({
        account_id: account.id,
      })

      return {
        ...account,
        ...accountStats,
      }
    })
  )

  res.json({ store_credit_accounts: accountsWithStats })
}
