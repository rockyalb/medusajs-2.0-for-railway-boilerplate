import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import Logo from "@modules/common/components/logo"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full bg-yco-panel/40 small:min-h-screen">
      <div className="h-16 border-b border-yco-cream-dark bg-white">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex flex-1 basis-0 items-center gap-x-2 text-small-semi uppercase text-yco-charcoal"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="rhode-eyebrow mt-px hidden hover:text-yco-coral small:block">
              Back to shopping cart
            </span>
            <span className="rhode-eyebrow mt-px block hover:text-yco-coral small:hidden">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="flex items-center gap-2 text-yco-charcoal"
            data-testid="store-link"
          >
            <Logo className="h-8 w-8" />
            <span className="rhode-eyebrow text-yco-charcoal">YCO</span>
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
