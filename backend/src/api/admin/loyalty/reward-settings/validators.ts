import { z } from "@medusajs/framework/zod"

export const AdminUpdateLoyaltyRewardSettingSchema = z.object({
  percentage: z.number().int().min(0).max(100),
  is_enabled: z.boolean(),
  start_date: z.string().datetime().nullable().optional(),
  end_date: z.string().datetime().nullable().optional(),
})

export type AdminUpdateLoyaltyRewardSettingType = z.infer<
  typeof AdminUpdateLoyaltyRewardSettingSchema
>
