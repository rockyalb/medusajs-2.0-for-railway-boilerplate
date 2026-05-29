"use client"

import { clx } from "@medusajs/ui"
import { ReactNode, useEffect, useMemo, useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnnouncementBar from "@modules/layout/components/announcement-bar"

type SimpleCategory = { id: string; name: string; handle: string }
type SimpleCollection = { id: string; title: string; handle: string }

type MenuCard = {
  title: string
  subtitle: string
  href: string
  badge?: string
}

type MenuTab = {
  key: string
  label: string
  cards: MenuCard[]
}

const navLink =
  "font-sans text-yco-charcoal text-xs font-bold tracking-[0.14em] uppercase hover:text-yco-coral transition-colors duration-300"

const secondaryLinks = [
  { label: "About", href: "/store" },
  { label: "FAQ", href: "/store" },
  { label: "Contact", href: "/store" },
]

function buildTabs(
  categories: SimpleCategory[],
  collections: SimpleCollection[]
): MenuTab[] {
  const tabs: MenuTab[] = []

  const featuredSource =
    collections.length > 0
      ? collections.slice(0, 4).map((c) => ({
          title: c.title,
          href: `/collections/${c.handle}`,
        }))
      : categories.slice(0, 4).map((c) => ({
          title: c.name,
          href: `/categories/${c.handle}`,
        }))

  if (featuredSource.length > 0) {
    tabs.push({
      key: "featured",
      label: "Featured",
      cards: featuredSource.map((item, i) => ({
        title: item.title,
        subtitle: "Explore the range",
        href: item.href,
        badge: i === 0 ? "new" : undefined,
      })),
    })
  }

  categories.slice(0, 5).forEach((cat) => {
    const base = `/categories/${cat.handle}`
    tabs.push({
      key: cat.id,
      label: cat.name,
      cards: [
        { title: "Bestsellers", subtitle: cat.name, href: base, badge: "new" },
        { title: "New in", subtitle: cat.name, href: base },
        { title: "Travel sizes", subtitle: cat.name, href: base },
        { title: `Shop all ${cat.name}`, subtitle: cat.name, href: base },
      ],
    })
  })

  return tabs
}

function Hamburger({
  open,
  onClick,
}: {
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      data-testid="nav-menu-button"
      className="flex flex-col justify-center gap-[5px] h-full w-7"
    >
      <span
        className={clx(
          "block h-[1.5px] w-6 bg-yco-charcoal transition-transform duration-300",
          open && "translate-y-[6.5px] rotate-45"
        )}
      />
      <span
        className={clx(
          "block h-[1.5px] w-6 bg-yco-charcoal transition-all duration-300",
          open ? "opacity-0" : "opacity-100"
        )}
      />
      <span
        className={clx(
          "block h-[1.5px] w-6 bg-yco-charcoal transition-transform duration-300",
          open && "-translate-y-[6.5px] -rotate-45"
        )}
      />
    </button>
  )
}

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="6" />
    <path d="M14 14l4 4" strokeLinecap="round" />
  </svg>
)

export default function NavClient({
  categories,
  collections,
  cartButton,
  searchEnabled,
}: {
  categories: SimpleCategory[]
  collections: SimpleCollection[]
  cartButton: ReactNode
  searchEnabled?: boolean
}) {
  const tabs = useMemo(
    () => buildTabs(categories, collections),
    [categories, collections]
  )
  const [shopOpen, setShopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "")
  const [mobileTab, setMobileTab] = useState(tabs[0]?.key ?? "")

  const hasMenu = tabs.length > 0
  const activeCards =
    tabs.find((t) => t.key === activeTab)?.cards ?? tabs[0]?.cards ?? []
  const mobileCards =
    tabs.find((t) => t.key === mobileTab)?.cards ?? tabs[0]?.cards ?? []

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <AnnouncementBar />

      <header
        className="relative bg-white border-b border-yco-cream-dark"
        onMouseLeave={() => setShopOpen(false)}
      >
        <nav className="content-container flex items-center justify-between w-full h-16">
          {/* Left: desktop links / mobile hamburger */}
          <div className="flex-1 basis-0 h-full flex items-center gap-x-7">
            <div className="h-full small:hidden flex items-center">
              <Hamburger
                open={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
              />
            </div>
            <div className="hidden small:flex items-center gap-x-7 h-full">
              <LocalizedClientLink
                className={navLink}
                href="/store"
                onMouseEnter={() => hasMenu && setShopOpen(true)}
              >
                Shop
              </LocalizedClientLink>
              <LocalizedClientLink
                className={navLink}
                href="/collections"
                onMouseEnter={() => setShopOpen(false)}
              >
                Brands
              </LocalizedClientLink>
              <LocalizedClientLink
                className={navLink}
                href="/store"
                onMouseEnter={() => setShopOpen(false)}
              >
                About
              </LocalizedClientLink>
            </div>
          </div>

          {/* Center: wordmark */}
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="font-sans text-yco-charcoal text-3xl font-black lowercase tracking-[-0.04em] leading-none hover:opacity-80 transition-opacity duration-300"
              data-testid="nav-store-link"
              onClick={closeMobile}
              onMouseEnter={() => setShopOpen(false)}
            >
              yco
            </LocalizedClientLink>
          </div>

          {/* Right: search / account / cart */}
          <div className="flex items-center gap-x-5 small:gap-x-7 h-full flex-1 basis-0 justify-end">
            {searchEnabled && (
              <LocalizedClientLink
                className="text-yco-charcoal hover:text-yco-coral transition-colors small:hidden"
                href="/search"
                scroll={false}
                aria-label="Search"
              >
                <SearchIcon />
              </LocalizedClientLink>
            )}
            {searchEnabled && (
              <LocalizedClientLink
                className={`hidden small:inline-block ${navLink}`}
                href="/search"
                scroll={false}
                data-testid="nav-search-link"
              >
                Search
              </LocalizedClientLink>
            )}
            <LocalizedClientLink
              className={`hidden small:inline-block ${navLink}`}
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            {cartButton}
          </div>
        </nav>

        {/* Floating SHOP mega-menu (desktop) */}
        {hasMenu && (
          <div
            className={clx(
              "absolute left-0 right-0 top-full hidden small:block bg-yco-panel border-b border-yco-cream-dark transition-all duration-300 ease-out",
              shopOpen
                ? "visible opacity-100 translate-y-0"
                : "invisible opacity-0 -translate-y-2 pointer-events-none"
            )}
            onMouseEnter={() => setShopOpen(true)}
          >
            <div className="content-container py-10">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-10">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onMouseEnter={() => setActiveTab(tab.key)}
                    onClick={() => setActiveTab(tab.key)}
                    className={clx(
                      "font-sans text-xs font-bold uppercase tracking-[0.16em] pb-1 border-b transition-colors duration-200",
                      activeTab === tab.key
                        ? "text-yco-charcoal border-yco-charcoal"
                        : "text-yco-charcoal-muted border-transparent hover:text-yco-charcoal"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activeCards.map((card, i) => (
                  <LocalizedClientLink
                    key={`${card.title}-${i}`}
                    href={card.href}
                    onClick={() => setShopOpen(false)}
                    className="group/card block rounded-large bg-white p-4 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="relative mb-4 aspect-square rounded-base bg-yco-panel-dark overflow-hidden">
                      {card.badge && (
                        <span className="absolute left-3 top-3 rounded-circle bg-yco-charcoal px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <div className="font-sans text-yco-charcoal text-sm font-bold uppercase tracking-[0.04em]">
                      {card.title}
                    </div>
                    <div className="font-sans text-yco-charcoal-muted text-xs mt-1">
                      {card.subtitle}
                    </div>
                  </LocalizedClientLink>
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <LocalizedClientLink
                  href="/store"
                  onClick={() => setShopOpen(false)}
                  className="rhode-pill"
                >
                  Shop YCO
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Full-screen mobile menu */}
      <div
        className={clx(
          "small:hidden fixed inset-0 z-[60] bg-white overflow-y-auto transition-opacity duration-300",
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="px-6 py-5 pb-12">
          <div className="mb-8 flex items-center justify-between border-b border-yco-cream-dark pb-5">
            <LocalizedClientLink
              href="/"
              className="font-sans text-yco-charcoal text-3xl font-black lowercase tracking-[-0.04em] leading-none"
              onClick={closeMobile}
            >
              yco
            </LocalizedClientLink>
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close menu"
              data-testid="close-mobile-menu-button"
              className="relative grid h-11 w-11 place-items-center rounded-circle border border-yco-charcoal/30 text-yco-charcoal transition-colors hover:bg-yco-charcoal hover:text-white"
            >
              <span className="absolute h-[1.5px] w-5 rotate-45 bg-current" />
              <span className="absolute h-[1.5px] w-5 -rotate-45 bg-current" />
            </button>
          </div>

          {hasMenu && (
            <>
              {/* Shop tabs */}
              <div className="flex gap-x-6 overflow-x-auto no-scrollbar border-b border-yco-cream-dark pb-3 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMobileTab(tab.key)}
                    className={clx(
                      "whitespace-nowrap font-sans text-xs font-bold uppercase tracking-[0.16em] pb-1 border-b transition-colors",
                      mobileTab === tab.key
                        ? "text-yco-charcoal border-yco-charcoal"
                        : "text-yco-charcoal-muted border-transparent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Product rows */}
              <div className="flex flex-col gap-3">
                {mobileCards.map((card, i) => (
                  <LocalizedClientLink
                    key={`${card.title}-${i}`}
                    href={card.href}
                    onClick={closeMobile}
                    className="flex items-center gap-4 rounded-large bg-yco-panel p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 rounded-base bg-yco-panel-dark" />
                    <div className="flex-1">
                      <div className="font-sans text-yco-charcoal text-sm font-bold uppercase tracking-[0.04em]">
                        {card.title}
                      </div>
                      <div className="font-sans text-yco-charcoal-muted text-xs mt-0.5">
                        {card.subtitle}
                      </div>
                    </div>
                    {card.badge && (
                      <span className="rounded-circle bg-yco-charcoal px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                        {card.badge}
                      </span>
                    )}
                  </LocalizedClientLink>
                ))}
              </div>

              <div className="mt-7 flex justify-center">
                <LocalizedClientLink
                  href="/store"
                  onClick={closeMobile}
                  className="rhode-pill"
                >
                  Shop YCO
                </LocalizedClientLink>
              </div>
            </>
          )}

          {/* Primary + secondary links */}
          <ul className="mt-10 border-t border-yco-cream-dark">
            {[
              { label: "Shop", href: "/store" },
              { label: "Brands", href: "/collections" },
              ...secondaryLinks,
              { label: "Account", href: "/account" },
            ].map((link) => (
              <li key={link.label} className="border-b border-yco-cream-dark">
                <LocalizedClientLink
                  href={link.href}
                  onClick={closeMobile}
                  className="block py-4 font-sans text-yco-charcoal text-2xl font-black lowercase tracking-[-0.02em] hover:text-yco-coral transition-colors"
                >
                  {link.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-sans text-yco-charcoal-muted text-xs tracking-[0.1em]">
            Country/region: United States (EUR €)
          </p>
        </div>
      </div>
    </div>
  )
}
