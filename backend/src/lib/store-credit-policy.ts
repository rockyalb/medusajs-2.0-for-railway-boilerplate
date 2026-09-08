export const MINIMUM_CREDIT_BALANCE = 500
export const MAXIMUM_CREDIT_SHARE = 0.25

export function maximumStoreCredit(balance: number, itemTotal: number, currency: string) {
  if (currency.toLowerCase() !== "all" || !Number.isFinite(balance) ||
      !Number.isFinite(itemTotal) || balance < MINIMUM_CREDIT_BALANCE || itemTotal <= 0) return 0
  // Round down so redemption never exceeds 25%, including fractional totals.
  return Math.floor(Math.min(balance, itemTotal * MAXIMUM_CREDIT_SHARE) * 100) / 100
}
