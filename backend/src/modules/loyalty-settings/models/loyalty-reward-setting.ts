import { model } from "@medusajs/framework/utils"

const LoyaltyRewardSetting = model.define("loyalty_reward_setting", {
  id: model.id().primaryKey(),
  key: model.text().unique(),
  percentage: model.number().default(2),
  is_enabled: model.boolean().default(true),
  start_date: model.dateTime().nullable(),
  end_date: model.dateTime().nullable(),
})

export default LoyaltyRewardSetting
