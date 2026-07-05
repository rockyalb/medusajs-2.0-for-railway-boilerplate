import { Module } from "@medusajs/framework/utils"
import HomepageSettingsModuleService from "./service"

export const HOMEPAGE_SETTINGS_MODULE = "homepageSettings"

export default Module(HOMEPAGE_SETTINGS_MODULE, {
  service: HomepageSettingsModuleService,
})
