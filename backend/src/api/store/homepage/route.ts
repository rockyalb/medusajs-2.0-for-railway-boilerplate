import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getHomepageSettings } from "../../../lib/homepage-settings"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ homepage: await getHomepageSettings(req.scope) })
}
