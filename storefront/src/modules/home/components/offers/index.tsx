import { getDiscountedProducts } from "@lib/data/discounts"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Reveal } from "@modules/common/components/motion"
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
          <Reveal className="mb-6 flex flex-col gap-5 small:mb-8 small:flex-row small:items-end small:justify-between small:gap-8">
            <div className="max-w-xl">
              <h2 className="yco-section-title rhode-display font-hanken text-3xl md:text-4xl">
                Pak më shumë kujdes, me më pak.
              </h2>
              <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-yco-charcoal-muted small:text-base">
                Zbulo produktet në ofertë dhe gjej të preferuarat për rutinën
                tënde.
              </p>
            </div>

            <LocalizedClientLink
              href="/discounts"
              className="yco-btn yco-btn--coral shrink-0 self-start small:self-end"
            >
              Shiko të gjitha ofertat
            </LocalizedClientLink>
          </Reveal>

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
