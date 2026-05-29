import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const colHeading =
  "font-sans text-yco-charcoal text-[11px] tracking-[0.22em] uppercase font-bold block mb-6"
const colLink =
  "font-sans text-yco-charcoal-muted text-sm hover:text-yco-charcoal transition-colors duration-300 inline-block"

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer className="bg-yco-panel w-full">
      <div className="content-container">
        {/* Oversized wordmark */}
        <div className="pt-16 pb-10 border-b border-yco-cream-dark">
          <span className="block font-sans font-black lowercase tracking-[-0.04em] leading-[0.8] text-yco-charcoal text-[24vw] small:text-[20vw]">
            yco
          </span>
        </div>

        {/* Newsletter + link columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-12 py-16">
          {/* Newsletter */}
          <div className="max-w-sm">
            <p className="font-sans text-yco-charcoal text-sm leading-relaxed mb-2">
              Join us for an effortless glow.
            </p>
            <p className="font-sans text-yco-charcoal-muted text-sm leading-relaxed mb-6">
              Tips, new arrivals, and the occasional treat — straight to your
              inbox.
            </p>
            <form className="flex items-center border-b border-yco-charcoal/40 max-w-xs">
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="flex-1 bg-transparent py-2 text-sm text-yco-charcoal placeholder:text-yco-charcoal-muted focus:outline-none"
              />
              <button
                type="submit"
                className="font-sans text-yco-charcoal text-[11px] font-bold tracking-[0.18em] uppercase pl-4 py-2 hover:text-yco-coral transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Navigate */}
            <div>
              <span className={colHeading}>Navigate</span>
              <ul className="grid grid-cols-1 gap-3">
                <li>
                  <LocalizedClientLink className={colLink} href="/store">
                    Shop
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className={colLink} href="/collections">
                    Brands
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className={colLink} href="/account">
                    Account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className={colLink} href="/cart">
                    Cart
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Shop categories */}
            {product_categories && product_categories.length > 0 && (
              <div>
                <span className={colHeading}>Categories</span>
                <ul className="grid grid-cols-1 gap-3" data-testid="footer-categories">
                  {product_categories.slice(0, 6).map((c) => {
                    if (c.parent_category) return null
                    return (
                      <li key={c.id}>
                        <LocalizedClientLink
                          className={colLink}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Collections / brands */}
            {collections && collections.length > 0 && (
              <div>
                <span className={colHeading}>Brands</span>
                <ul className="grid grid-cols-1 gap-3">
                  {collections.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className={colLink}
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Support */}
            <div>
              <span className={colHeading}>Support</span>
              <ul className="grid grid-cols-1 gap-3">
                {[
                  { label: "About Us", href: "/store" },
                  { label: "Sustainability", href: "/store" },
                  { label: "FAQ", href: "/store" },
                  { label: "Contact", href: "/store" },
                  { label: "Privacy Policy", href: "/store" },
                ].map((link) => (
                  <li key={link.label}>
                    <LocalizedClientLink className={colLink} href={link.href}>
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-8 gap-3 border-t border-yco-cream-dark">
          <p className="font-sans text-yco-charcoal-muted text-xs">
            © {new Date().getFullYear()} YCO Organics
          </p>
          <p className="font-sans text-yco-charcoal-muted text-xs tracking-[0.1em]">
            Country/region: United States (EUR €)
          </p>
        </div>
      </div>
    </footer>
  )
}
