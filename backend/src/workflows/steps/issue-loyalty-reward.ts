import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { LOYALTY_SETTINGS_MODULE } from "../../modules/loyalty-settings"
import {
  DEFAULT_LOYALTY_REWARD_PERCENTAGE,
  DEFAULT_LOYALTY_REWARD_SETTING_KEY,
} from "./upsert-loyalty-reward-setting"

type IssueLoyaltyRewardInput = {
  order_id: string
}

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    return Number(value)
  }

  if (value && typeof value === "object" && "value" in value) {
    return Number((value as { value: unknown }).value)
  }

  if (value && typeof value === "object" && "numeric" in value) {
    return Number((value as { numeric: unknown }).numeric)
  }

  return 0
}

const isCampaignActive = (setting: any): boolean => {
  if (setting?.is_enabled === false) {
    return false
  }

  const now = Date.now()
  const start = setting?.start_date ? new Date(setting.start_date).getTime() : null
  const end = setting?.end_date ? new Date(setting.end_date).getTime() : null

  if (start && now < start) {
    return false
  }

  if (end && now > end) {
    return false
  }

  return true
}

const getOrderItemTotal = (order: any): number => {
  const directTotal = toNumber(order.item_total ?? order.item_subtotal)

  if (directTotal > 0) {
    return directTotal
  }

  const lineItemsTotal = (order.items ?? []).reduce(
    (sum: number, item: any) => {
      const itemTotal = toNumber(
        item.item_total ?? item.item_subtotal ?? item.total ?? item.subtotal
      )

      if (itemTotal > 0) {
        return sum + itemTotal
      }

      return sum + toNumber(item.unit_price) * toNumber(item.quantity)
    },
    0
  )

  if (lineItemsTotal > 0) {
    return lineItemsTotal
  }

  return toNumber(
    order.summary?.totals?.item_total ??
      order.summary?.totals?.item_subtotal ??
      order.subtotal
  )
}

export const issueLoyaltyRewardStep = createStep(
  "issue-loyalty-reward",
  async ({ order_id }: IssueLoyaltyRewardInput, { container }) => {
    const orderService = container.resolve(Modules.ORDER) as any
    const customerService = container.resolve(Modules.CUSTOMER) as any
    const storeCreditService = container.resolve("store_credit") as any
    const loyaltySettingsService = container.resolve(
      LOYALTY_SETTINGS_MODULE
    ) as any

    const order = await orderService.retrieveOrder(order_id, {
      relations: ["summary", "items"],
    })

    if (!order.currency_code) {
      return new StepResponse(null)
    }

    let rewardCustomerId = order.customer_id
    const customer = order.customer_id
      ? await customerService.retrieveCustomer(order.customer_id)
      : null

    if (customer?.has_account !== true) {
      const [registeredCustomer] = order.email
        ? await customerService.listCustomers({
            email: order.email,
            has_account: true,
          } as any)
        : []

      if (!registeredCustomer) {
        return new StepResponse(null)
      }

      rewardCustomerId = registeredCustomer.id
    }

    if (!rewardCustomerId) {
      return new StepResponse(null)
    }

    const [setting] =
      await loyaltySettingsService.listLoyaltyRewardSettings({
        key: DEFAULT_LOYALTY_REWARD_SETTING_KEY,
      })

    const percentage =
      setting?.percentage ?? DEFAULT_LOYALTY_REWARD_PERCENTAGE

    if (!isCampaignActive(setting) || percentage <= 0) {
      return new StepResponse(null)
    }

    const existingTransactions =
      await storeCreditService.listAccountTransactions({
        reference: "loyalty_reward",
        reference_id: order.id,
      } as any)

    if (existingTransactions.length) {
      return new StepResponse(null)
    }

    const eligibleTotal = getOrderItemTotal(order)
    const rewardAmount =
      Math.round(((eligibleTotal * percentage) / 100) * 100) / 100

    if (rewardAmount <= 0) {
      return new StepResponse(null)
    }

    const [existingAccount] =
      await storeCreditService.listStoreCreditAccounts({
        customer_id: rewardCustomerId,
        currency_code: order.currency_code,
      })

    const account =
      existingAccount ??
      (await storeCreditService.createStoreCreditAccounts({
        customer_id: rewardCustomerId,
        currency_code: order.currency_code,
      }))

    const [transaction] = await storeCreditService.creditAccounts([
      {
        account_id: account.id,
        amount: rewardAmount,
        note: `${percentage}% loyalty reward for order ${order.display_id ?? order.id}`,
        reference: "loyalty_reward",
        reference_id: order.id,
      },
    ])

    return new StepResponse(
      {
        account_id: account.id,
        amount: rewardAmount,
        transaction_id: transaction.id,
      },
      {
        account_id: account.id,
        amount: rewardAmount,
        order_id: order.id,
      }
    )
  },
  async (reward, { container }) => {
    if (!reward) {
      return
    }

    const storeCreditService = container.resolve("store_credit") as any
    await storeCreditService.debitAccounts([
      {
        account_id: reward.account_id,
        amount: reward.amount,
        note: "Rollback loyalty reward",
        reference: "loyalty_reward_rollback",
        reference_id: reward.order_id,
      },
    ])
  }
)
