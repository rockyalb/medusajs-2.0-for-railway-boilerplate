import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Logo from "@modules/common/components/logo"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative h-16 mx-auto border-b duration-200 bg-yco-cream border-yco-cream-dark">
        <nav className="content-container flex items-center justify-between w-full h-full">
          {/* Left: mobile menu */}
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>

          {/* Center: logo */}
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 hover:opacity-95 transition-opacity duration-300"
              data-testid="nav-store-link"
            >
              <Logo className="w-10 h-10 transition-transform duration-300 hover:scale-105 active:scale-95" />
            </LocalizedClientLink>
          </div>

          {/* Right: links + cart */}
          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-7 h-full">
              <LocalizedClientLink
                className="font-sans text-yco-charcoal text-xs tracking-[0.12em] uppercase hover:text-yco-coral transition-all duration-300 active:scale-95 inline-block"
                href="/store"
              >
                Shop
              </LocalizedClientLink>
              <LocalizedClientLink
                className="font-sans text-yco-charcoal text-xs tracking-[0.12em] uppercase hover:text-yco-coral transition-all duration-300 active:scale-95 inline-block"
                href="/collections"
              >
                Brands
              </LocalizedClientLink>
              {process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED && (
                <LocalizedClientLink
                  className="font-sans text-yco-charcoal text-xs tracking-[0.12em] uppercase hover:text-yco-coral transition-all duration-300 active:scale-95 inline-block"
                  href="/search"
                  scroll={false}
                  data-testid="nav-search-link"
                >
                  Search
                </LocalizedClientLink>
              )}
              <LocalizedClientLink
                className="font-sans text-yco-charcoal text-xs tracking-[0.12em] uppercase hover:text-yco-coral transition-all duration-300 active:scale-95 inline-block"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="font-sans text-yco-charcoal text-xs tracking-[0.12em] uppercase hover:text-yco-coral transition-all duration-300 active:scale-95 flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
