import { defineMiddlewares } from "@medusajs/framework/http"
import { adminLoyaltyRewardSettingMiddlewares } from "./admin/loyalty/reward-settings/middlewares"

export default defineMiddlewares({
  routes: [...adminLoyaltyRewardSettingMiddlewares],
})
