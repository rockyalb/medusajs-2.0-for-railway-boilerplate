import { defineMiddlewares } from "@medusajs/framework/http"
import { adminHomepageMiddlewares } from "./admin/homepage/middlewares"
import { adminLoyaltyRewardSettingMiddlewares } from "./admin/loyalty/reward-settings/middlewares"
import { adminProductDefaultsMiddlewares } from "./admin/products/middlewares"

export default defineMiddlewares({
  routes: [
    ...adminLoyaltyRewardSettingMiddlewares,
    ...adminHomepageMiddlewares,
    ...adminProductDefaultsMiddlewares,
  ],
})
