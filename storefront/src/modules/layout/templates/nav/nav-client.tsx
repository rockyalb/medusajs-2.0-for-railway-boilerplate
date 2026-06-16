"use client"

import { clx } from "@medusajs/ui"
import { ReactNode, useEffect, useState } from "react"

import { BRAND_LOGOS } from "@lib/data/brand-logos"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnnouncementBar from "@modules/layout/components/announcement-bar"

type SimpleCategory = {
  id: string
  name: string
  handle: string
  image?: string
  children?: SimpleCategory[]
}

// Full literal class names so Tailwind keeps these hand-written @layer rules.
const ACCENT_CLASSES = [
  "yco-accent--mint",
  "yco-accent--coral",
  "yco-accent--blue",
] as const
type SimpleCollection = {
  id: string
  title: string
  handle: string
}
type ShopPanel = "categories" | "brands"
type MobileSection = "categories" | "brands" | null

const navLink =
  "font-sans text-yco-charcoal text-xs font-bold tracking-[0.14em] uppercase hover:text-yco-coral transition-colors duration-300"

const secondaryLinks = [
  { label: "Rreth nesh", href: "/store" },
  { label: "FAQ", href: "/store" },
  { label: "Kontakt", href: "/store" },
]

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
      aria-label={open ? "Mbyll menunë" : "Hap menunë"}
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
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="9" cy="9" r="6" />
    <path d="M14 14l4 4" strokeLinecap="round" />
  </svg>
)

function CategoryNestedList({
  categories,
  activeCategoryId,
  setActiveCategoryId,
  onNavigate,
}: {
  categories: SimpleCategory[]
  activeCategoryId: string
  setActiveCategoryId: (id: string) => void
  onNavigate: () => void
}) {
  const activeIndex = Math.max(
    categories.findIndex((category) => category.id === activeCategoryId),
    0
  )
  const activeCategory = categories[activeIndex]
  const children = activeCategory?.children ?? []
  const accentClass = ACCENT_CLASSES[activeIndex % ACCENT_CLASSES.length]

  return (
    <div className="grid min-h-[24rem] grid-cols-[0.62fr_1fr_0.72fr] gap-10">
      <div className="overflow-y-auto pr-2">
        <div className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal-muted">
          Kategoritë
        </div>
        <ul className="space-y-1">
          {categories.map((category) => {
            const isActive = activeCategory?.id === category.id

            return (
              <li key={category.id}>
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  onMouseEnter={() => setActiveCategoryId(category.id)}
                  onFocus={() => setActiveCategoryId(category.id)}
                  onClick={onNavigate}
                  className={clx(
                    "group flex items-center justify-between rounded-base px-3 py-3 font-sans text-sm font-bold uppercase tracking-[0.08em] transition-colors",
                    isActive
                      ? "bg-white text-yco-charcoal shadow-sm"
                      : "text-yco-charcoal-muted hover:bg-white hover:text-yco-charcoal"
                  )}
                >
                  <span>{category.name}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className={clx(
                      "shrink-0 transition-all duration-200",
                      isActive
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                    )}
                  >
                    <path
                      d="M9 8l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>
      </div>

      <div
        key={activeCategory?.id}
        className="animate-fade-in-top overflow-y-auto border-l border-yco-cream-dark pl-10 motion-reduce:animate-none"
      >
        {activeCategory && (
          <>
            <div className="mb-5 flex items-center justify-between gap-6">
              <h3 className="rhode-display text-4xl">
                {activeCategory.name.toLowerCase()}
              </h3>
              <LocalizedClientLink
                href={`/categories/${activeCategory.handle}`}
                onClick={onNavigate}
                className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal hover:text-yco-coral transition-colors"
              >
                Shiko të gjitha
              </LocalizedClientLink>
            </div>

            {children.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                {children.map((child) => (
                  <li key={child.id}>
                    <LocalizedClientLink
                      href={`/categories/${child.handle}`}
                      onClick={onNavigate}
                      className="block rounded-base px-3 py-2 font-sans text-sm text-yco-charcoal-muted transition-colors hover:bg-white hover:text-yco-charcoal"
                    >
                      {child.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-large bg-white p-6 font-sans text-sm text-yco-charcoal-muted">
                Nuk ka ende nënkategori në këtë kategori.
              </div>
            )}
          </>
        )}
      </div>

      {activeCategory && (
        <LocalizedClientLink
          key={`${activeCategory.id}-card`}
          href={`/categories/${activeCategory.handle}`}
          onClick={onNavigate}
          className={clx(
            accentClass,
            "yco-accent-card group flex animate-fade-in-top flex-col justify-between overflow-hidden rounded-large p-4 motion-reduce:animate-none"
          )}
          aria-label={`Bli ${activeCategory.name}`}
        >
          <div className="aspect-[4/3] overflow-hidden rounded-rounded bg-white">
            {activeCategory.image ? (
              <img
                src={activeCategory.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-sans text-6xl font-black lowercase text-yco-charcoal/20">
                {activeCategory.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="font-sans text-sm font-bold text-yco-charcoal">
                {activeCategory.name}
              </div>
              <p className="mt-0.5 font-sans text-xs text-yco-charcoal-muted">
                Shfleto kategorinë
              </p>
            </div>
            <span className="rhode-round-btn rhode-round-btn--accent h-9 w-9 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 8l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </LocalizedClientLink>
      )}
    </div>
  )
}

function BrandsList({
  collections,
  onNavigate,
}: {
  collections: SimpleCollection[]
  onNavigate: () => void
}) {
  return (
    <div className="min-h-[24rem] animate-fade-in-top overflow-y-auto pr-2 motion-reduce:animate-none">
      <div className="mb-5 flex items-center justify-between">
        <div className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal-muted">
          Brendet
        </div>
        <LocalizedClientLink
          href="/collections"
          onClick={onNavigate}
          className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal hover:text-yco-coral transition-colors"
        >
          Shiko të gjitha
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {collections.map((collection) => {
          const logo = BRAND_LOGOS[collection.handle]

          return (
            <li key={collection.id}>
              <LocalizedClientLink
                href={`/collections/${collection.handle}`}
                onClick={onNavigate}
                className="group flex h-full flex-col items-center gap-3 rounded-large border border-transparent bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-yco-cream-dark hover:shadow-md"
              >
                <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-rounded p-2">
                  {logo ? (
                    <img
                      src={logo}
                      alt=""
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-sans text-3xl font-black lowercase text-yco-charcoal/30">
                      {collection.title.slice(0, 1)}
                    </span>
                  )}
                </span>
                <span className="text-center font-sans text-xs font-bold leading-tight text-yco-charcoal">
                  {collection.title}
                </span>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function MobileCategoryPanel({
  categories,
  activeCategoryId,
  setActiveCategoryId,
  onNavigate,
}: {
  categories: SimpleCategory[]
  activeCategoryId: string
  setActiveCategoryId: (id: string) => void
  onNavigate: () => void
}) {
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? null
  const children = activeCategory?.children ?? []

  return (
    <div className="border-t border-yco-cream-dark">
      {categories.map((category) => {
        const expanded = activeCategory?.id === category.id

        return (
          <div key={category.id} className="border-b border-yco-cream-dark">
            <button
              type="button"
              onClick={() =>
                setActiveCategoryId(expanded ? "" : category.id)
              }
              className="flex w-full items-center justify-between py-4 text-left font-sans text-lg font-bold text-yco-charcoal"
              aria-expanded={expanded}
            >
              <span>{category.name}</span>
              <span className="text-xl leading-none">
                {expanded ? "-" : "+"}
              </span>
            </button>

            <div
              className={clx(
                "yco-expand-grid",
                expanded ? "yco-expand-grid--open" : "yco-expand-grid--closed"
              )}
            >
              <div className="yco-expand-grid__inner">
                <div className="pb-5">
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    onClick={onNavigate}
                    className="mb-4 inline-block font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal hover:text-yco-coral"
                  >
                    Shiko të gjitha {category.name}
                  </LocalizedClientLink>

                  {children.length > 0 ? (
                    <ul className="space-y-1">
                      {children.map((child) => (
                        <li key={child.id}>
                          <LocalizedClientLink
                            href={`/categories/${child.handle}`}
                            onClick={onNavigate}
                            className="block rounded-base px-3 py-3 font-sans text-sm text-yco-charcoal-muted transition-colors hover:bg-yco-panel hover:text-yco-charcoal"
                          >
                            {child.name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-large bg-yco-panel p-4 font-sans text-sm text-yco-charcoal-muted">
                      Nuk ka ende nënkategori në këtë kategori.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MobileBrandPanel({
  collections,
  onNavigate,
}: {
  collections: SimpleCollection[]
  onNavigate: () => void
}) {
  return (
    <ul className="space-y-1 border-t border-yco-cream-dark pt-4">
      {collections.map((collection) => (
        <li key={collection.id}>
          <LocalizedClientLink
            href={`/collections/${collection.handle}`}
            onClick={onNavigate}
            className="block rounded-base px-3 py-3 font-sans text-sm text-yco-charcoal-muted transition-colors hover:bg-yco-panel hover:text-yco-charcoal"
          >
            {collection.title}
          </LocalizedClientLink>
        </li>
      ))}
    </ul>
  )
}

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
  const [shopOpen, setShopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<ShopPanel>(
    categories.length > 0 ? "categories" : "brands"
  )
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? ""
  )
  const [mobileSection, setMobileSection] = useState<MobileSection>(null)
  const [mobileActiveCategoryId, setMobileActiveCategoryId] = useState("")

  const hasMenu = categories.length > 0 || collections.length > 0

  useEffect(() => {
    if (!activeCategoryId && categories[0]?.id) {
      setActiveCategoryId(categories[0].id)
    }
  }, [activeCategoryId, categories])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen && !shopOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
        setShopOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileOpen, shopOpen])

  const closeMobile = () => setMobileOpen(false)
  const closeShop = () => setShopOpen(false)
  const toggleMobileSection = (section: Exclude<MobileSection, null>) => {
    setMobileSection((current) => (current === section ? null : section))
    if (section === "categories") {
      setMobileActiveCategoryId("")
    }
  }

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <AnnouncementBar />

      <header
        className="relative bg-white border-b border-yco-cream-dark"
        onMouseLeave={closeShop}
      >
        <nav className="content-container flex items-center justify-between w-full h-16">
          <div className="flex-1 basis-0 h-full flex items-center gap-x-7">
            <div className="h-full small:hidden flex items-center">
              <Hamburger
                open={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
              />
            </div>
            <div className="hidden small:flex items-center gap-x-7 h-full">
              <button
                type="button"
                className={navLink}
                onMouseEnter={() => hasMenu && setShopOpen(true)}
                onClick={() => setShopOpen((open) => !open)}
                aria-expanded={shopOpen}
                aria-controls="shop-megamenu"
              >
                Dyqani
              </button>
              <LocalizedClientLink
                className={navLink}
                href="/collections"
                onMouseEnter={closeShop}
              >
                Brendet
              </LocalizedClientLink>
              <LocalizedClientLink
                className={navLink}
                href="/store"
                onMouseEnter={closeShop}
              >
                Rreth nesh
              </LocalizedClientLink>
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="hover:opacity-80 transition-opacity duration-300"
              data-testid="nav-store-link"
              onClick={closeMobile}
              onMouseEnter={closeShop}
            >
              <img
                src="/image2vector.svg"
                alt="yco"
                className="h-8 w-auto"
              />
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-5 small:gap-x-7 h-full flex-1 basis-0 justify-end">
            <LocalizedClientLink
              className="text-yco-charcoal hover:text-yco-coral transition-colors small:hidden"
              href="/search"
              scroll={false}
              aria-label="Kërko"
            >
              <SearchIcon />
            </LocalizedClientLink>
            <LocalizedClientLink
              className={`hidden small:inline-block ${navLink}`}
              href="/search"
              scroll={false}
              data-testid="nav-search-link"
            >
              Kërko
            </LocalizedClientLink>
            <LocalizedClientLink
              className={`hidden small:inline-block ${navLink}`}
              href="/account"
              data-testid="nav-account-link"
            >
              Llogaria
            </LocalizedClientLink>
            {cartButton}
          </div>
        </nav>

        {/* Dim the page below while the megamenu is open. */}
        <div
          aria-hidden
          className={clx(
            "pointer-events-none absolute left-0 right-0 top-full hidden h-screen bg-yco-charcoal/25 transition-opacity duration-300 small:block",
            shopOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {hasMenu && (
          <div
            id="shop-megamenu"
            className={clx(
              "absolute left-0 right-0 top-full hidden small:block bg-yco-panel border-b border-yco-cream-dark shadow-[0_32px_60px_-36px_rgba(47,45,41,0.45)] transition-all duration-300 ease-out",
              shopOpen
                ? "visible opacity-100 translate-y-0"
                : "invisible opacity-0 -translate-y-2 pointer-events-none"
            )}
            onMouseEnter={() => setShopOpen(true)}
          >
            <div className="content-container max-h-[calc(100vh-8rem)] overflow-y-auto py-8">
              <div className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
                {categories.length > 0 && (
                  <button
                    type="button"
                    onMouseEnter={() => setActivePanel("categories")}
                    onClick={() => setActivePanel("categories")}
                    className={clx(
                      "font-sans text-xs font-bold uppercase tracking-[0.16em] pb-1 border-b transition-colors duration-200",
                      activePanel === "categories"
                        ? "text-yco-charcoal border-yco-charcoal"
                        : "text-yco-charcoal-muted border-transparent hover:text-yco-charcoal"
                    )}
                  >
                    Kategoritë
                  </button>
                )}
                {collections.length > 0 && (
                  <button
                    type="button"
                    onMouseEnter={() => setActivePanel("brands")}
                    onClick={() => setActivePanel("brands")}
                    className={clx(
                      "font-sans text-xs font-bold uppercase tracking-[0.16em] pb-1 border-b transition-colors duration-200",
                      activePanel === "brands"
                        ? "text-yco-charcoal border-yco-charcoal"
                        : "text-yco-charcoal-muted border-transparent hover:text-yco-charcoal"
                    )}
                  >
                    Brendet
                  </button>
                )}
              </div>

              {activePanel === "categories" && categories.length > 0 ? (
                <CategoryNestedList
                  categories={categories}
                  activeCategoryId={activeCategoryId}
                  setActiveCategoryId={setActiveCategoryId}
                  onNavigate={closeShop}
                />
              ) : (
                <BrandsList collections={collections} onNavigate={closeShop} />
              )}
            </div>
          </div>
        )}
      </header>

      <div
        className={clx(
          "small:hidden fixed inset-0 z-[60] bg-white overflow-y-auto transition-opacity duration-300",
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigimi mobil"
      >
        <div className="px-6 py-5 pb-12">
          <div className="mb-8 flex items-center justify-between border-b border-yco-cream-dark pb-5">
            <LocalizedClientLink
              href="/"
              className="hover:opacity-80 transition-opacity duration-300"
              onClick={closeMobile}
            >
              <img
                src="/image2vector.svg"
                alt="yco"
                className="h-8 w-auto"
              />
            </LocalizedClientLink>
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Mbyll menunë"
              data-testid="close-mobile-menu-button"
              className="relative grid h-11 w-11 place-items-center rounded-circle border border-yco-charcoal/30 text-yco-charcoal transition-colors hover:bg-yco-charcoal hover:text-white"
            >
              <span className="absolute h-[1.5px] w-5 rotate-45 bg-current" />
              <span className="absolute h-[1.5px] w-5 -rotate-45 bg-current" />
            </button>
          </div>

          <LocalizedClientLink
            href="/search"
            scroll={false}
            onClick={closeMobile}
            className="mb-5 flex min-h-[52px] items-center gap-3 rounded-large border border-yco-cream-dark bg-yco-panel px-4 font-sans text-sm text-yco-charcoal-muted"
          >
            <SearchIcon />
            Kërko produkte, brende dhe kategori
          </LocalizedClientLink>

          {categories.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => toggleMobileSection("categories")}
                className="flex w-full items-center justify-between border-b border-yco-cream-dark py-4 text-left font-sans text-2xl font-black lowercase tracking-[-0.02em] text-yco-charcoal"
                aria-expanded={mobileSection === "categories"}
              >
                <span>Kategoritë</span>
                <span className="text-xl">
                  {mobileSection === "categories" ? "-" : "+"}
                </span>
              </button>

              <div
                className={clx(
                  "yco-expand-grid",
                  mobileSection === "categories"
                    ? "yco-expand-grid--open"
                    : "yco-expand-grid--closed"
                )}
              >
                <div className="yco-expand-grid__inner">
                  <MobileCategoryPanel
                    categories={categories}
                    activeCategoryId={mobileActiveCategoryId}
                    setActiveCategoryId={setMobileActiveCategoryId}
                    onNavigate={closeMobile}
                  />
                </div>
              </div>
            </div>
          )}

          {collections.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => toggleMobileSection("brands")}
                className="flex w-full items-center justify-between border-b border-yco-cream-dark py-4 text-left font-sans text-2xl font-black lowercase tracking-[-0.02em] text-yco-charcoal"
                aria-expanded={mobileSection === "brands"}
              >
                <span>Brendet</span>
                <span className="text-xl">
                  {mobileSection === "brands" ? "-" : "+"}
                </span>
              </button>

              <div
                className={clx(
                  "yco-expand-grid",
                  mobileSection === "brands"
                    ? "yco-expand-grid--open"
                    : "yco-expand-grid--closed"
                )}
              >
                <div className="yco-expand-grid__inner">
                  <MobileBrandPanel
                    collections={collections}
                    onNavigate={closeMobile}
                  />
                </div>
              </div>
            </div>
          )}

          <ul className="border-t border-yco-cream-dark">
            {[
              { label: "Dyqani", href: "/store" },
              { label: "Të gjitha brendet", href: "/collections" },
              ...secondaryLinks,
              { label: "Llogaria", href: "/account" },
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
        </div>
      </div>
    </div>
  )
}
