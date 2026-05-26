import { MedusaService } from "@medusajs/framework/utils"
import LoyaltyRewardSetting from "./models/loyalty-reward-setting"

class LoyaltySettingsModuleService extends MedusaService({
  LoyaltyRewardSetting,
}) {}

export default LoyaltySettingsModuleService
