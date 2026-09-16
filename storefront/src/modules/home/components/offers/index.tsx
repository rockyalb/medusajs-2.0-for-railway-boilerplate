import { getDiscountedProducts } from "@lib/data/discounts"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function OffersSection({
  countryCode,
}: {
  countryCode: string
}) {
  try {
    const { products } = await getDiscountedProducts({
      countryCode,
      page: 1,
      sortBy: "created_at",
    })

    if (!products.length) {
      return null
    }

    return (
      <section className="yco-section yco-accent--coral bg-white/55 px-6 py-10 small:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4 small:mb-8 small:gap-8">
            <div>
              <h2 className="yco-section-title rhode-display text-3xl md:text-4xl">
                Ofertat
              </h2>
            </div>

            <LocalizedClientLink
              href="/discounts"
              className="shrink-0 border-b border-yco-charcoal pb-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-yco-charcoal transition-colors duration-300 hover:border-pastel-coral-ink hover:text-pastel-coral-ink small:text-xs small:tracking-[0.18em]"
            >
              Shiko të gjitha
            </LocalizedClientLink>
          </div>

          <ProductRail
            products={products}
            discountedOnly
            ariaLabel="Produktet në ofertë"
          />
        </div>
      </section>
    )
  } catch {
    // Offers are optional marketing content; a catalog failure must not break
    // the rest of the homepage.
    return null
  }
}
