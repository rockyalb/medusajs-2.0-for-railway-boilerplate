import { model } from "@medusajs/framework/utils"

const HomepageSetting = model.define("homepage_setting", {
  id: model.id().primaryKey(),
  key: model.text().unique(),
  value: model.json().default({}),
})

export default HomepageSetting
