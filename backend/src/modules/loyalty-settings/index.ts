import { Module } from "@medusajs/framework/utils"
import LoyaltySettingsModuleService from "./service"

export const LOYALTY_SETTINGS_MODULE = "loyaltySettings"

export default Module(LOYALTY_SETTINGS_MODULE, {
  service: LoyaltySettingsModuleService,
})
