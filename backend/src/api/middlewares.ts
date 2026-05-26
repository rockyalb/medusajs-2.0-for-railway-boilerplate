import { defineMiddlewares } from "@medusajs/framework/http"
import { adminLoyaltyRewardSettingMiddlewares } from "./admin/loyalty/reward-settings/middlewares"
import { storeCustomerStoreCreditAccountMiddlewares } from "./store/customer/store-credit-accounts/middlewares"

export default defineMiddlewares({
  routes: [
    ...adminLoyaltyRewardSettingMiddlewares,
    ...storeCustomerStoreCreditAccountMiddlewares,
  ],
})
