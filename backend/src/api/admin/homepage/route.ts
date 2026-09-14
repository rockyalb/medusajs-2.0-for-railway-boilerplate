import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  EMPTY_HOMEPAGE_SETTINGS,
  HOMEPAGE_BESTSELLERS_KEY,
  HOMEPAGE_CATEGORY_CARDS_KEY,
  HOMEPAGE_HERO_KEY,
  getHomepageSettings,
  upsertHomepageSetting,
} from "../../../lib/homepage-settings"
import { expireStorefrontHomepageCache } from "../../../lib/storefront-cache"
import { updateHomepageProductOfTheMonthWorkflow } from "../../../workflows/update-homepage-product-of-the-month"
import { AdminUpdateHomepageType } from "./validators"
import { updateHomepageNavigationWorkflow } from "../../../workflows/update-homepage-navigation"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ homepage: await getHomepageSettings(req.scope) })
}

export async function POST(
  req: MedusaRequest<AdminUpdateHomepageType>,
  res: MedusaResponse
) {
  const {
    hero,
    category_cards,
    bestsellers,
    product_of_the_month,
    navigation,
  } = req.validatedBody

  if (navigation) {
    await updateHomepageNavigationWorkflow(req.scope).run({
      input: navigation,
    })
  }

  if (hero) {
    await upsertHomepageSetting(req.scope, HOMEPAGE_HERO_KEY, {
      ...EMPTY_HOMEPAGE_SETTINGS.hero,
      ...hero,
    })
  }

  if (category_cards) {
    await upsertHomepageSetting(
      req.scope,
      HOMEPAGE_CATEGORY_CARDS_KEY,
      category_cards
    )
  }

  if (bestsellers) {
    await upsertHomepageSetting(req.scope, HOMEPAGE_BESTSELLERS_KEY, {
      product_ids: Array.from(new Set(bestsellers.product_ids)),
    })
  }

  if (product_of_the_month) {
    await updateHomepageProductOfTheMonthWorkflow(req.scope).run({
      input: {
        product_id: product_of_the_month.product_id ?? null,
        description: product_of_the_month.description ?? null,
      },
    })
  }

  const revalidated = await expireStorefrontHomepageCache()

  res.json({
    homepage: await getHomepageSettings(req.scope),
    revalidated,
  })
}
