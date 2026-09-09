"use client"

import { lockPageScroll } from "@lib/util/lock-page-scroll"

import { clx } from "@medusajs/ui"
import {
  SearchIcon,
  MenuIcon,
  CloseIcon,
  headerChipClass,
} from "@modules/layout/components/header-controls"
import { ReactNode, useEffect, useState } from "react"

import { BRAND_LOGOS } from "@lib/data/brand-logos"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnnouncementBar from "@modules/layout/components/announcement-bar"

type SimpleCategory = {
  id: string
  name: string
  handle: string
  children?: SimpleCategory[]
}

// Full literal class names so Tailwind keeps these hand-written @layer rules.
type SimpleCollection = {
  id: string
  title: string
  handle: string
}
type ShopPanel = "categories" | "brands"
type MobileSection = "categories" | "brands" | null

const navLink =
  "inline-flex min-h-11 items-center px-2 font-hanken text-yco-charcoal text-xs font-bold tracking-[0.14em] uppercase hover:text-yco-coral transition-colors duration-300"

const secondaryLinks = [
  { label: "Rreth nesh", href: "/historia-jone" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
]

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Mbyll menunë" : "Hap menunë"}
      aria-expanded={open}
      data-testid="nav-menu-button"
      className={headerChipClass}
    >
      {open ? <CloseIcon /> : <MenuIcon />}
    </button>
  )
}

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

  return (
    <div className="grid min-h-[24rem] grid-cols-[0.52fr_1fr] gap-10">
      <div className="overflow-y-auto pr-2">
        <div className="mb-4 font-hanken text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal-muted">
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
                    "group flex items-center justify-between rounded-base px-3 py-3 font-hanken text-sm font-bold uppercase tracking-[0.08em] transition-colors",
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
            <div className="mb-5">
              <h3 className="rhode-display text-4xl">{activeCategory.name}</h3>
            </div>

            {children.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                <li>
                  <LocalizedClientLink
                    href={`/categories/${activeCategory.handle}`}
                    onClick={onNavigate}
                    className="block rounded-base px-3 py-2 font-hanken text-sm font-bold text-yco-charcoal transition-colors hover:bg-white hover:text-yco-coral"
                  >
                    Shiko të gjitha
                  </LocalizedClientLink>
                </li>
                {children.map((child) => (
                  <li key={child.id}>
                    <LocalizedClientLink
                      href={`/categories/${child.handle}`}
                      onClick={onNavigate}
                      className="block rounded-base px-3 py-2 font-hanken text-sm text-yco-charcoal-muted transition-colors hover:bg-white hover:text-yco-charcoal"
                    >
                      {child.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            ) : (
              <LocalizedClientLink
                href={`/categories/${activeCategory.handle}`}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-6 rounded-large bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="max-w-xs font-hanken text-sm text-yco-charcoal-muted">
                  Zbulo krejt produktet e kategorisë{" "}
                  <span className="font-bold text-yco-charcoal">
                    {activeCategory.name}
                  </span>
                  .
                </p>
                <span className="yco-btn yco-btn--ink shrink-0">
                  Shiko produktet
                </span>
              </LocalizedClientLink>
            )}
          </>
        )}
      </div>
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
        <div className="font-hanken text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal-muted">
          Brendet
        </div>
        <LocalizedClientLink
          href="/collections"
          onClick={onNavigate}
          className="font-hanken text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal hover:text-yco-coral transition-colors"
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
                    <span className="font-hanken text-3xl font-black lowercase text-yco-charcoal/30">
                      {collection.title.slice(0, 1)}
                    </span>
                  )}
                </span>
                <span className="text-center font-hanken text-xs font-bold leading-tight text-yco-charcoal">
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
              onClick={() => setActiveCategoryId(expanded ? "" : category.id)}
              className="flex min-h-12 w-full items-center justify-between py-2 text-left font-hanken text-lg font-bold text-yco-charcoal"
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
                <div className="pb-2">
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    onClick={onNavigate}
                    className="mb-1 flex min-h-10 items-center rounded-base px-3 py-1.5 font-hanken text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal hover:bg-yco-panel hover:text-yco-coral"
                  >
                    Shiko të gjitha {category.name}
                  </LocalizedClientLink>

                  {children.length > 0 ? (
                    <ul className="space-y-0">
                      {children.map((child) => (
                        <li key={child.id}>
                          <LocalizedClientLink
                            href={`/categories/${child.handle}`}
                            onClick={onNavigate}
                            className="flex min-h-10 items-center rounded-base px-3 py-1.5 font-hanken text-sm text-yco-charcoal-muted transition-colors hover:bg-yco-panel hover:text-yco-charcoal"
                          >
                            {child.name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
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
    <div className="border-t border-yco-cream-dark pt-2">
      <LocalizedClientLink
        href="/collections"
        onClick={onNavigate}
        className="yco-btn yco-btn--ink mb-2 min-h-11 w-full px-4 text-[0.7rem]"
      >
        Të gjitha brendet
      </LocalizedClientLink>
      <ul className="space-y-0">
        {collections.map((collection) => (
          <li key={collection.id}>
            <LocalizedClientLink
              href={`/collections/${collection.handle}`}
              onClick={onNavigate}
              className="flex min-h-10 items-center rounded-base px-3 py-1.5 font-hanken text-sm text-yco-charcoal-muted transition-colors hover:bg-yco-panel hover:text-yco-charcoal"
            >
              {collection.title}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
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
    if (!mobileOpen) return
    return lockPageScroll()
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
    <div id="site-header" className="font-hanken sticky top-0 inset-x-0 z-50">
      <header
        className="relative border-b border-yco-cream-dark bg-yco-header-pink/90 shadow-[0_20px_48px_-32px_rgba(47,45,41,0.45)] backdrop-blur-md"
        onMouseLeave={closeShop}
      >
        <div className="overflow-hidden">
          <AnnouncementBar />
        </div>
        {/* Mobile ran 8px shorter than desktop and read cramped against the
            announcement bar; both are 56px now. */}
        <nav className="content-container flex h-14 w-full items-center justify-between">
          <div className="flex-1 basis-0 h-full flex items-center gap-x-7">
            <div className="h-full small:hidden flex items-center">
              <Hamburger
                open={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
              />
            </div>
            <div className="hidden small:flex items-center gap-x-7 h-full">
              <LocalizedClientLink
                href="/"
                className="mr-3 hover:opacity-80 transition-opacity duration-300"
                data-testid="nav-store-link"
                onMouseEnter={closeShop}
              >
                <img
                  src="/image2vector.svg"
                  alt="yco"
                  className="h-10 w-auto"
                />
              </LocalizedClientLink>
              <button
                type="button"
                className={navLink}
                onMouseEnter={() => hasMenu && setShopOpen(true)}
                onClick={() => setShopOpen((open) => !open)}
                aria-expanded={shopOpen}
                aria-controls="shop-megamenu"
              >
                Produktet
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
                href="/historia-jone"
                onMouseEnter={closeShop}
              >
                Rreth nesh
              </LocalizedClientLink>
            </div>
          </div>

          <div className="flex items-center h-full small:hidden">
            <LocalizedClientLink
              href="/"
              className="hover:opacity-80 transition-opacity duration-300"
              data-testid="nav-store-link"
              onClick={closeMobile}
              onMouseEnter={closeShop}
            >
              <img src="/image2vector.svg" alt="yco" className="h-9 w-auto" />
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-2.5 small:gap-x-7">
            <LocalizedClientLink
              className={`${headerChipClass} small:hidden`}
              href="/search"
              scroll={false}
              aria-label="Kërko"
            >
              <SearchIcon />
            </LocalizedClientLink>
            <LocalizedClientLink
              className={`hidden small:inline-flex ${navLink}`}
              href="/search"
              scroll={false}
              data-testid="nav-search-link"
            >
              Kërko
            </LocalizedClientLink>
            <LocalizedClientLink
              className={`hidden small:inline-flex ${navLink}`}
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
              "absolute left-0 right-0 top-full hidden small:block transition-all duration-300 ease-out",
              shopOpen
                ? "visible opacity-100 translate-y-0"
                : "invisible opacity-0 -translate-y-2 pointer-events-none"
            )}
            onMouseEnter={() => setShopOpen(true)}
          >
            <div className="overflow-hidden border-b border-yco-cream-dark bg-yco-panel shadow-[0_32px_60px_-36px_rgba(47,45,41,0.45)]">
              <div className="content-container max-h-[calc(100vh-5rem)] overflow-y-auto py-8">
                <div className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
                  {categories.length > 0 && (
                    <button
                      type="button"
                      onMouseEnter={() => setActivePanel("categories")}
                      onClick={() => setActivePanel("categories")}
                      className={clx(
                        "font-hanken text-xs font-bold uppercase tracking-[0.16em] pb-1 border-b transition-colors duration-200",
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
                        "font-hanken text-xs font-bold uppercase tracking-[0.16em] pb-1 border-b transition-colors duration-200",
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
                  <BrandsList
                    collections={collections}
                    onNavigate={closeShop}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <div
        className={clx(
          "small:hidden fixed inset-0 z-[999] bg-yco-panel/95 overflow-y-auto transition-opacity duration-300 backdrop-blur-md",
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigimi mobil"
      >
        <div className="px-6 py-5 pb-12">
          <div className="mb-5 flex items-center justify-between border-b border-yco-cream-dark pb-4">
            <LocalizedClientLink
              href="/"
              className="hover:opacity-80 transition-opacity duration-300"
              onClick={closeMobile}
            >
              <img src="/image2vector.svg" alt="yco" className="h-10 w-auto" />
            </LocalizedClientLink>
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Mbyll menunë"
              data-testid="close-mobile-menu-button"
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-circle border border-yco-charcoal bg-yco-charcoal text-white shadow-[0_12px_28px_-18px_rgba(47,45,41,0.75)] transition-colors hover:bg-yco-coral hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 focus-visible:ring-offset-yco-panel"
            >
              <span className="absolute h-[1.5px] w-5 rotate-45 bg-current" />
              <span className="absolute h-[1.5px] w-5 -rotate-45 bg-current" />
            </button>
          </div>

          <LocalizedClientLink
            href="/search"
            scroll={false}
            onClick={closeMobile}
            className="mb-4 flex min-h-[48px] items-center gap-3 rounded-large border border-yco-cream-dark bg-yco-panel px-4 font-hanken text-sm text-yco-charcoal-muted"
          >
            <SearchIcon />
            Kërko produkte, brende dhe kategori
          </LocalizedClientLink>

          {categories.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => toggleMobileSection("categories")}
                className="flex min-h-12 w-full items-center justify-between border-b border-yco-cream-dark py-2.5 text-left font-hanken text-2xl font-black tracking-[-0.02em] text-yco-charcoal"
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
                className="flex min-h-12 w-full items-center justify-between border-b border-yco-cream-dark py-2.5 text-left font-hanken text-2xl font-black tracking-[-0.02em] text-yco-charcoal"
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
              { label: "Produktet", href: "/store" },
              ...secondaryLinks,
              { label: "Llogaria", href: "/account" },
            ].map((link) => (
              <li key={link.label} className="border-b border-yco-cream-dark">
                <LocalizedClientLink
                  href={link.href}
                  onClick={closeMobile}
                  className="flex min-h-12 items-center py-2.5 font-hanken text-yco-charcoal text-2xl font-black tracking-[-0.02em] hover:text-yco-coral transition-colors"
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
