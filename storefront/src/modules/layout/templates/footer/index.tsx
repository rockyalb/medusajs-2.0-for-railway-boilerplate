import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"

const SocialIcon = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-yco-green hover:text-yco-coral transition-colors duration-300 active:scale-95 inline-block"
  >
    {children}
  </a>
)

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer className="bg-yco-charcoal w-full text-yco-cream border-t border-yco-cream-dark/10">
      <div className="content-container">

        {/* Main footer grid */}
        <div className="grid grid-cols-1 xsmall:grid-cols-2 md:grid-cols-4 gap-12 py-20 border-b border-yco-charcoal-muted/20">

          {/* Brand column */}
          <div className="xsmall:col-span-2 md:col-span-1">
            <LocalizedClientLink href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity duration-300 mb-4">
              <Logo className="w-9 h-9" />
              <span className="font-serif text-yco-cream text-2xl tracking-wide">YCO</span>
            </LocalizedClientLink>
            <p className="font-sans text-yco-green text-xs leading-relaxed mb-6 max-w-[200px]">
              The home of certified organic, zero-waste, and natural products.
            </p>
            <p className="font-sans text-yco-charcoal-muted text-[10px] tracking-[0.2em] uppercase mb-4">
              Follow us
            </p>
            <div className="flex gap-4">
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://tiktok.com" label="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Shop by category */}
          {product_categories && product_categories.length > 0 && (
            <div>
              <span className="font-sans text-yco-cream text-xs tracking-[0.2em] uppercase font-medium block mb-6">
                Categories
              </span>
              <ul className="grid grid-cols-1 gap-3" data-testid="footer-categories">
                {product_categories.slice(0, 6).map((c) => {
                  if (c.parent_category) return null
                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className={clx(
                          "font-sans text-yco-green text-xs hover:text-yco-coral transition-colors duration-300 active:scale-95 inline-block",
                          c.category_children?.length && "font-medium"
                        )}
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

          {/* Collections / Brands */}
          {collections && collections.length > 0 && (
            <div>
              <span className="font-sans text-yco-cream text-xs tracking-[0.2em] uppercase font-medium block mb-6">
                Brands
              </span>
              <ul className="grid grid-cols-1 gap-3">
                {collections.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      className="font-sans text-yco-green text-xs hover:text-yco-coral transition-colors duration-300 active:scale-95 inline-block"
                      href={`/collections/${c.handle}`}
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info column */}
          <div>
            <span className="font-sans text-yco-cream text-xs tracking-[0.2em] uppercase font-medium block mb-6">
              Company
            </span>
            <ul className="grid grid-cols-1 gap-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Sustainability", href: "/sustainability" },
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
              ].map((link) => (
                <li key={link.label}>
                  <LocalizedClientLink
                    className="font-sans text-yco-green text-xs hover:text-yco-coral transition-colors duration-300 active:scale-95 inline-block"
                    href={link.href}
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-8 gap-3">
          <p className="font-sans text-yco-charcoal-muted text-xs">
            © {new Date().getFullYear()} YCO Organics. All rights reserved.
          </p>
          <p className="font-sans text-yco-green/80 text-xs italic font-serif">
            Good for you, good for the planet.
          </p>
        </div>

      </div>
    </footer>
  )
}
