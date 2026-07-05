import {
  MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { AdminUpdateHomepageSchema } from "./validators"

export const adminHomepageMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/homepage",
    method: "POST",
    middlewares: [validateAndTransformBody(AdminUpdateHomepageSchema)],
  },
]
