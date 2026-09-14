import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  getHomepageSettings,
  HOMEPAGE_NAVIGATION_KEY,
  upsertHomepageSetting,
} from "../lib/homepage-settings"

type NavigationSettings = { show_discounts: boolean }

const updateNavigationStep = createStep(
  "update-homepage-navigation-settings",
  async (input: NavigationSettings, { container }) => {
    const previous = (await getHomepageSettings(container)).navigation
    await upsertHomepageSetting(container, HOMEPAGE_NAVIGATION_KEY, input)
    return new StepResponse(input, previous)
  },
  async (previous, { container }) => {
    if (previous)
      await upsertHomepageSetting(container, HOMEPAGE_NAVIGATION_KEY, previous)
  }
)

export const updateHomepageNavigationWorkflow = createWorkflow(
  "update-homepage-navigation",
  function (input: NavigationSettings) {
    return new WorkflowResponse(updateNavigationStep(input))
  }
)
