import { getProductOfTheMonth } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import PotmBanner from "./banner"

const ALBANIAN_MONTHS = [
  "Janar",
  "Shkurt",
  "Mars",
  "Prill",
  "Maj",
  "Qershor",
  "Korrik",
  "Gusht",
  "Shtator",
  "Tetor",
  "Nëntor",
  "Dhjetor",
]

export default async function ProductOfTheMonth({
  countryCode,
}: {
  countryCode: string
}) {
  const product = await getProductOfTheMonth(countryCode)

  if (!product) {
    return null
  }

  const { cheapestPrice } = getProductPrice({ product })

  return (
    <PotmBanner
      title={product.title}
      subtitle={product.subtitle ?? null}
      description={product.description ?? null}
      handle={product.handle}
      image={product.thumbnail || product.images?.[0]?.url || ""}
      price={cheapestPrice?.calculated_price ?? null}
      originalPrice={
        cheapestPrice?.price_type === "sale"
          ? cheapestPrice.original_price
          : null
      }
      monthLabel={ALBANIAN_MONTHS[new Date().getUTCMonth()]}
    />
  )
}
