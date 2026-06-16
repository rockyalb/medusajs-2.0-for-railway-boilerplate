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
        {/* Newsletter + link columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-12 pt-14 pb-16 border-t border-yco-cream-dark">
          {/* Newsletter */}
          <div className="max-w-sm">
            <LocalizedClientLink
              href="/"
              aria-label="Kreu i YCO"
              className="inline-block mb-6 hover:opacity-80 transition-opacity duration-300"
            >
              <img
                src="/image2vector.svg"
                alt="YCO"
                className="h-12 w-auto"
              />
            </LocalizedClientLink>
            <p className="font-sans text-yco-charcoal text-sm leading-relaxed mb-2">
              Bashkohuni me ne për një shkëlqim natyral.
            </p>
            <p className="font-sans text-yco-charcoal-muted text-sm leading-relaxed mb-6">
              Këshilla, produkte të reja dhe oferta të veçanta direkt në
              emailin tuaj.
            </p>
            <form className="flex items-center border-b border-yco-charcoal/40 max-w-xs">
              <input
                type="email"
                placeholder="Adresa e email-it"
                aria-label="Adresa e email-it"
                className="flex-1 bg-transparent py-2 text-sm text-yco-charcoal placeholder:text-yco-charcoal-muted focus:outline-none"
              />
              <button
                type="submit"
                className="font-sans text-yco-charcoal text-[11px] font-bold tracking-[0.18em] uppercase pl-4 py-2 hover:text-yco-coral transition-colors"
              >
                Abonohu
              </button>
            </form>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Navigate */}
            <div>
              <span className={colHeading}>Navigo</span>
              <ul className="grid grid-cols-1 gap-3">
                <li>
                  <LocalizedClientLink className={colLink} href="/store">
                    Dyqani
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className={colLink} href="/collections">
                    Brendet
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className={colLink} href="/account">
                    Llogaria
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className={colLink} href="/cart">
                    Shporta
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Shop categories */}
            {product_categories && product_categories.length > 0 && (
              <div>
                <span className={colHeading}>Kategoritë</span>
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
                <span className={colHeading}>Brendet</span>
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
              <span className={colHeading}>Mbështetje</span>
              <ul className="grid grid-cols-1 gap-3">
                {[
                  { label: "Historia jone", href: "/historia-jone" },
                  { label: "Diferenca jone", href: "/diferenca-jone" },
                  { label: "Blog", href: "/blog" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Transporti", href: "/transporti" },
                  { label: "Kushtet", href: "/kushtet-dhe-rregullat" },
                  { label: "Privatesia", href: "/politika-e-privatesise" },
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
            Shteti/rajoni: Shqipëri (ALL L)
          </p>
        </div>
      </div>
    </footer>
  )
}
