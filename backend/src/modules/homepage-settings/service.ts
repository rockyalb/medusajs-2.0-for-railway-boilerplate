import { MedusaService } from "@medusajs/framework/utils"
import HomepageSetting from "./models/homepage-setting"

class HomepageSettingsModuleService extends MedusaService({
  HomepageSetting,
}) {}

export default HomepageSettingsModuleService
