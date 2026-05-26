import {
  MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { AdminUpdateLoyaltyRewardSettingSchema } from "./validators"

export const adminLoyaltyRewardSettingMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/loyalty/reward-settings",
    method: "POST",
    middlewares: [
      validateAndTransformBody(AdminUpdateLoyaltyRewardSettingSchema),
    ],
  },
]
