import { MedusaContainer } from "@medusajs/framework/types"
import { HOMEPAGE_SETTINGS_MODULE } from "../modules/homepage-settings"

export const HOMEPAGE_PRODUCT_OF_THE_MONTH_KEY = "product_of_the_month"
export const HOMEPAGE_HERO_KEY = "hero"
export const HOMEPAGE_CATEGORY_CARDS_KEY = "category_cards"
export const HOMEPAGE_BESTSELLERS_KEY = "bestsellers"
export const HOMEPAGE_NAVIGATION_KEY = "navigation"

export type HomepageHeroSettings = {
  image_url: string | null
  image_alt: string | null
  eyebrow: string | null
  headline: string | null
  cta_label: string | null
  cta_href: string | null
}

export type HomepageCategoryCardsSettings = {
  /** category_id -> image url override */
  images: Record<string, string>
}

export type HomepageBestsellersSettings = {
  /** ordered product ids shown in the bestsellers section */
  product_ids: string[]
}

export type HomepageSettings = {
  navigation: { show_discounts: boolean }
  product_of_the_month: {
    product_id: string | null
    description: string | null
  }
  hero: HomepageHeroSettings
  category_cards: HomepageCategoryCardsSettings
  bestsellers: HomepageBestsellersSettings
}

export const EMPTY_HOMEPAGE_SETTINGS: HomepageSettings = {
  navigation: { show_discounts: true },
  product_of_the_month: { product_id: null, description: null },
  hero: {
    image_url: null,
    image_alt: null,
    eyebrow: null,
    headline: null,
    cta_label: null,
    cta_href: null,
  },
  category_cards: { images: {} },
  bestsellers: { product_ids: [] },
}

export const getHomepageSettings = async (
  scope: MedusaContainer
): Promise<HomepageSettings> => {
  const homepageSettingsService = scope.resolve(HOMEPAGE_SETTINGS_MODULE) as any
  const settings = await homepageSettingsService.listHomepageSettings({
    key: [
      HOMEPAGE_PRODUCT_OF_THE_MONTH_KEY,
      HOMEPAGE_HERO_KEY,
      HOMEPAGE_CATEGORY_CARDS_KEY,
      HOMEPAGE_BESTSELLERS_KEY,
      HOMEPAGE_NAVIGATION_KEY,
    ],
  })

  const valueByKey = Object.fromEntries(
    settings.map((setting: { key: string; value: unknown }) => [
      setting.key,
      setting.value,
    ])
  )

  return {
    navigation: {
      ...EMPTY_HOMEPAGE_SETTINGS.navigation,
      ...((valueByKey[HOMEPAGE_NAVIGATION_KEY] as object) ?? {}),
    },
    product_of_the_month: {
      ...EMPTY_HOMEPAGE_SETTINGS.product_of_the_month,
      ...((valueByKey[HOMEPAGE_PRODUCT_OF_THE_MONTH_KEY] as object) ?? {}),
    },
    hero: {
      ...EMPTY_HOMEPAGE_SETTINGS.hero,
      ...((valueByKey[HOMEPAGE_HERO_KEY] as object) ?? {}),
    },
    category_cards: {
      ...EMPTY_HOMEPAGE_SETTINGS.category_cards,
      ...((valueByKey[HOMEPAGE_CATEGORY_CARDS_KEY] as object) ?? {}),
    },
    bestsellers: {
      ...EMPTY_HOMEPAGE_SETTINGS.bestsellers,
      ...((valueByKey[HOMEPAGE_BESTSELLERS_KEY] as object) ?? {}),
    },
  }
}

export const upsertHomepageSetting = async (
  scope: MedusaContainer,
  key: string,
  value: unknown
) => {
  const homepageSettingsService = scope.resolve(HOMEPAGE_SETTINGS_MODULE) as any
  const [existing] = await homepageSettingsService.listHomepageSettings({
    key,
  })

  if (existing) {
    await homepageSettingsService.updateHomepageSettings({
      id: existing.id,
      value,
    })
  } else {
    await homepageSettingsService.createHomepageSettings({ key, value })
  }
}
