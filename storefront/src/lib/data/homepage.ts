import { sdk } from "@lib/config"
import { cache } from "react"

export type HomepageHeroSettings = {
  image_url: string | null
  image_alt: string | null
  eyebrow: string | null
  headline: string | null
  cta_label: string | null
  cta_href: string | null
}

export type HomepageSettings = {
  navigation: { show_discounts: boolean }
  product_of_the_month: {
    product_id: string | null
    description: string | null
  }
  hero: HomepageHeroSettings
  category_cards: { images: Record<string, string> }
  bestsellers: { product_ids: string[] }
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

export const getHomepageSettings = cache(async function () {
  return sdk.client
    .fetch<{ homepage: HomepageSettings }>("/store/homepage", {
      next: { tags: ["homepage"] },
    })
    .then(({ homepage }) => ({
      navigation: {
        ...EMPTY_HOMEPAGE_SETTINGS.navigation,
        ...(homepage?.navigation ?? {}),
      },
      product_of_the_month: {
        ...EMPTY_HOMEPAGE_SETTINGS.product_of_the_month,
        ...(homepage?.product_of_the_month ?? {}),
      },
      hero: { ...EMPTY_HOMEPAGE_SETTINGS.hero, ...(homepage?.hero ?? {}) },
      category_cards: {
        images: homepage?.category_cards?.images ?? {},
      },
      bestsellers: {
        product_ids: homepage?.bestsellers?.product_ids ?? [],
      },
    }))
    .catch(() => EMPTY_HOMEPAGE_SETTINGS)
})
