import { authenticate, MiddlewareRoute } from "@medusajs/framework/http"

export const storeCustomerStoreCreditAccountMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customer/store-credit-accounts",
    method: "GET",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
]
