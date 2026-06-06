"use client"

import { clx } from "@medusajs/ui"
import { ReactNode, useEffect, useMemo, useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnnouncementBar from "@modules/layout/components/announcement-bar"

type SimpleCategory = {
  id: string
  name: string
  handle: string
  products?: SimpleMenuProduct[]
  children?: SimpleCategory[]
}
type SimpleMenuProduct = {
  id: string
  title: string
  handle: string
  image: string
}
type SimpleCollection = {
  id: string
  title: string
  handle: string
  products?: SimpleMenuProduct[]
}
type ShopPanel = "categories" | "brands"
type MobileSection = "categories" | "brands" | null

const navLink =
  "font-sans text-yco-charcoal text-xs font-bold tracking-[0.14em] uppercase hover:text-yco-coral transition-colors duration-300"

const secondaryLinks = [
  { label: "About", href: "/store" },
  { label: "FAQ", href: "/store" },
  { label: "Contact", href: "/store" },
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
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ??
    categories[0]
  const children = activeCategory?.children ?? []
  const products = activeCategory?.products ?? []

  return (
    <div className="grid min-h-[22rem] grid-cols-[0.78fr_1.22fr] gap-10">
      <div className="overflow-y-auto pr-4">
        <div className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal-muted">
          Categories
        </div>
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                onMouseEnter={() => setActiveCategoryId(category.id)}
                onFocus={() => setActiveCategoryId(category.id)}
                onClick={onNavigate}
                className={clx(
                  "group flex items-center justify-between rounded-base px-3 py-3 font-sans text-sm font-bold uppercase tracking-[0.08em] transition-colors",
                  activeCategory?.id === category.id
                    ? "bg-white text-yco-charcoal"
                    : "text-yco-charcoal-muted hover:bg-white hover:text-yco-charcoal"
                )}
              >
                <span>{category.name}</span>
                {(category.children?.length ?? 0) > 0 && (
                  <span className="text-yco-charcoal-muted transition-transform group-hover:translate-x-1">
                    {category.children?.length}
                  </span>
                )}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-y-auto border-l border-yco-cream-dark pl-10">
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
                View all
              </LocalizedClientLink>
            </div>

            {children.length > 0 ? (
              <ul className="grid grid-cols-2 gap-4">
                {children.map((child) => (
                  <li key={child.id}>
                    <LocalizedClientLink
                      href={`/categories/${child.handle}`}
                      onClick={onNavigate}
                      className="group block rounded-large bg-white p-3 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-base bg-yco-panel-dark">
                        {child.products?.[0]?.image ? (
                          <img
                            src={child.products[0].image}
                            alt={child.products[0].title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-sans text-4xl font-black lowercase text-yco-charcoal/20">
                            {child.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-yco-charcoal">
                        {child.name}
                      </div>
                      {child.products?.[0]?.title && (
                        <div className="mt-1 font-sans text-[11px] leading-tight text-yco-charcoal-muted">
                          {child.products[0].title}
                        </div>
                      )}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            ) : products.length > 0 ? (
              <ul className="grid grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => (
                  <li key={product.id}>
                    <LocalizedClientLink
                      href={`/products/${product.handle}`}
                      onClick={onNavigate}
                      className="group block rounded-large bg-white p-3 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="mb-3 aspect-square overflow-hidden rounded-base bg-yco-panel-dark">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-sans text-4xl font-black lowercase text-yco-charcoal/20">
                            {product.title.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="font-sans text-xs font-bold uppercase tracking-[0.06em] text-yco-charcoal">
                        {product.title}
                      </div>
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-large bg-white p-6 font-sans text-sm text-yco-charcoal-muted">
                No products found in this category yet.
              </div>
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
    <div className="min-h-[22rem] overflow-y-auto pr-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal-muted">
          Brands
        </div>
        <LocalizedClientLink
          href="/collections"
          onClick={onNavigate}
          className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal hover:text-yco-coral transition-colors"
        >
          View all
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1">
        {collections.map((collection) => (
          <li key={collection.id}>
            <LocalizedClientLink
              href={`/collections/${collection.handle}`}
              onClick={onNavigate}
              className="block rounded-base px-3 py-2 font-sans text-sm text-yco-charcoal-muted transition-colors hover:bg-white hover:text-yco-charcoal"
            >
              {collection.title}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MenuImageCard({
  href,
  title,
  subtitle,
  image,
  onNavigate,
}: {
  href: string
  title: string
  subtitle?: string
  image?: string
  onNavigate: () => void
}) {
  return (
    <LocalizedClientLink
      href={href}
      onClick={onNavigate}
      className="group block rounded-large bg-yco-panel p-3"
    >
      <div className="mb-3 aspect-square overflow-hidden rounded-base bg-yco-panel-dark">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-sans text-3xl font-black lowercase text-yco-charcoal/20">
            {title.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="font-sans text-xs font-bold uppercase tracking-[0.06em] text-yco-charcoal">
        {title}
      </div>
      {subtitle && (
        <div className="mt-1 font-sans text-[11px] leading-tight text-yco-charcoal-muted">
          {subtitle}
        </div>
      )}
    </LocalizedClientLink>
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
  const products = activeCategory?.products ?? []

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

            {expanded && (
              <div className="pb-5">
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  onClick={onNavigate}
                  className="mb-4 inline-block font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal hover:text-yco-coral"
                >
                  View all {category.name}
                </LocalizedClientLink>

                {children.length > 0 ? (
                  <div className="-mx-6 overflow-x-auto px-6 pb-2">
                    <div className="flex gap-3">
                    {children.map((child) => (
                      <div key={child.id} className="w-[42vw] min-w-[9.5rem] max-w-[12rem] shrink-0">
                        <MenuImageCard
                          href={`/categories/${child.handle}`}
                          title={child.name}
                          subtitle={child.products?.[0]?.title}
                          image={child.products?.[0]?.image}
                          onNavigate={onNavigate}
                        />
                      </div>
                    ))}
                    </div>
                  </div>
                ) : products.length > 0 ? (
                  <div className="-mx-6 overflow-x-auto px-6 pb-2">
                    <div className="flex gap-3">
                    {products.slice(0, 6).map((product) => (
                      <div key={product.id} className="w-[42vw] min-w-[9.5rem] max-w-[12rem] shrink-0">
                        <MenuImageCard
                          href={`/products/${product.handle}`}
                          title={product.title}
                          image={product.image}
                          onNavigate={onNavigate}
                        />
                      </div>
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-large bg-yco-panel p-4 font-sans text-sm text-yco-charcoal-muted">
                    No products found in this category yet.
                  </div>
                )}
              </div>
            )}
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
    <div className="grid grid-cols-2 gap-3 border-t border-yco-cream-dark pt-4">
      {collections.map((collection) => {
        const product = collection.products?.[0]

        return (
          <MenuImageCard
            key={collection.id}
            href={`/collections/${collection.handle}`}
            title={collection.title}
            subtitle={product?.title}
            image={product?.image}
            onNavigate={onNavigate}
          />
        )
      })}
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
                Shop
              </button>
              <LocalizedClientLink
                className={navLink}
                href="/collections"
                onMouseEnter={closeShop}
              >
                Brands
              </LocalizedClientLink>
              <LocalizedClientLink
                className={navLink}
                href="/store"
                onMouseEnter={closeShop}
              >
                About
              </LocalizedClientLink>
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="font-sans text-yco-charcoal text-3xl font-black lowercase tracking-[-0.04em] leading-none hover:opacity-80 transition-opacity duration-300"
              data-testid="nav-store-link"
              onClick={closeMobile}
              onMouseEnter={closeShop}
            >
              yco
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-5 small:gap-x-7 h-full flex-1 basis-0 justify-end">
            <LocalizedClientLink
              className="text-yco-charcoal hover:text-yco-coral transition-colors small:hidden"
              href="/search"
              scroll={false}
              aria-label="Search"
            >
              <SearchIcon />
            </LocalizedClientLink>
            <LocalizedClientLink
              className={`hidden small:inline-block ${navLink}`}
              href="/search"
              scroll={false}
              data-testid="nav-search-link"
            >
              Search
            </LocalizedClientLink>
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

        {hasMenu && (
          <div
            id="shop-megamenu"
            className={clx(
              "absolute left-0 right-0 top-full hidden small:block bg-yco-panel border-b border-yco-cream-dark transition-all duration-300 ease-out",
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
                    Categories
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
                    Brands
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

          <LocalizedClientLink
            href="/search"
            scroll={false}
            onClick={closeMobile}
            className="mb-5 flex min-h-[52px] items-center gap-3 rounded-large border border-yco-cream-dark bg-yco-panel px-4 font-sans text-sm text-yco-charcoal-muted"
          >
            <SearchIcon />
            Search products, brands, and categories
          </LocalizedClientLink>

          {categories.length > 0 && (
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleMobileSection("categories")}
                className="flex w-full items-center justify-between border-b border-yco-cream-dark py-4 text-left font-sans text-2xl font-black lowercase tracking-[-0.02em] text-yco-charcoal"
                aria-expanded={mobileSection === "categories"}
              >
                <span>Categories</span>
                <span className="text-xl">
                  {mobileSection === "categories" ? "-" : "+"}
                </span>
              </button>

              {mobileSection === "categories" && (
                <MobileCategoryPanel
                  categories={categories}
                  activeCategoryId={mobileActiveCategoryId}
                  setActiveCategoryId={setMobileActiveCategoryId}
                  onNavigate={closeMobile}
                />
              )}
            </div>
          )}

          {collections.length > 0 && (
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleMobileSection("brands")}
                className="flex w-full items-center justify-between border-b border-yco-cream-dark py-4 text-left font-sans text-2xl font-black lowercase tracking-[-0.02em] text-yco-charcoal"
                aria-expanded={mobileSection === "brands"}
              >
                <span>Brands</span>
                <span className="text-xl">
                  {mobileSection === "brands" ? "-" : "+"}
                </span>
              </button>

              {mobileSection === "brands" && (
                <MobileBrandPanel
                  collections={collections}
                  onNavigate={closeMobile}
                />
              )}
            </div>
          )}

          <ul className="mt-10 border-t border-yco-cream-dark">
            {[
              { label: "Shop", href: "/store" },
              { label: "All brands", href: "/collections" },
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
        </div>
      </div>
    </div>
  )
}
