import { getProductOfTheMonth } from "@lib/data/products"
import { getHomepageSettings } from "@lib/data/homepage"
import PotmBanner from "./banner"

export default async function ProductOfTheMonth({
  countryCode,
}: {
  countryCode: string
}) {
  const homepage = await getHomepageSettings()
  const settings = homepage.product_of_the_month
  const product = await getProductOfTheMonth(countryCode, settings.product_id)

  if (!product) {
    return null
  }

  const metadata = (product.metadata || {}) as Record<string, unknown>
  const whyChosen =
    typeof metadata.product_of_the_month_reason === "string"
      ? metadata.product_of_the_month_reason
      : typeof metadata.product_of_month_reason === "string"
        ? metadata.product_of_month_reason
        : null

  return (
    <PotmBanner
      title={product.title}
      subtitle={product.subtitle ?? null}
      description={product.description ?? null}
      whyChosen={whyChosen}
      homepageDescription={settings.product_id === product.id ? settings.description : null}
      handle={product.handle}
      image={product.thumbnail || product.images?.[0]?.url || ""}
    />
  )
}
