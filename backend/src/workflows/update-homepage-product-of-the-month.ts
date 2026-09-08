import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { getHomepageSettings, HOMEPAGE_PRODUCT_OF_THE_MONTH_KEY, upsertHomepageSetting } from "../lib/homepage-settings"

type Settings = { product_id: string | null; description: string | null }

const updateSettingsStep = createStep(
  "update-homepage-product-of-the-month-settings",
  async (input: Settings, { container }) => {
    if (input.product_id) {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({ entity: "product", fields: ["id", "status"], filters: { id: input.product_id } })
      if (!data[0] || data[0].status !== "published") {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Choose a published product.")
      }
    }
    const previous = (await getHomepageSettings(container)).product_of_the_month
    const value = { product_id: input.product_id, description: input.product_id ? input.description?.trim() || null : null }
    await upsertHomepageSetting(container, HOMEPAGE_PRODUCT_OF_THE_MONTH_KEY, value)
    return new StepResponse(value, previous)
  },
  async (previous, { container }) => {
    if (previous) await upsertHomepageSetting(container, HOMEPAGE_PRODUCT_OF_THE_MONTH_KEY, previous)
  }
)

export const updateHomepageProductOfTheMonthWorkflow = createWorkflow(
  "update-homepage-product-of-the-month",
  function (input: Settings) {
    return new WorkflowResponse(updateSettingsStep(input))
  }
)
