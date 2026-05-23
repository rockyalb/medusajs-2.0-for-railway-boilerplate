import {
  listShippingOptionsForCartWorkflow,
  listShippingOptionsForCartWithPricingWorkflow,
} from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"

const normalizeCity = (city?: string | null) => {
  return city
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

const getDeliveryCityContext = ({ cart }) => {
  const city = normalizeCity(cart.shipping_address?.city)

  return new StepResponse({
    delivery_city_group: city === "tirane" ? "tirane" : "other",
  })
}

listShippingOptionsForCartWorkflow.hooks.setShippingOptionsContext(
  getDeliveryCityContext
)

listShippingOptionsForCartWithPricingWorkflow.hooks.setShippingOptionsContext(
  getDeliveryCityContext
)
