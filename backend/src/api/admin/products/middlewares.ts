import { MiddlewareRoute } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const adminProductDefaultsMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/products",
    method: "POST",
    additionalDataValidator: {
      yco_initial_stock: z
        .array(z.number().int().min(0))
        .max(500)
        .optional(),
    },
  },
]
