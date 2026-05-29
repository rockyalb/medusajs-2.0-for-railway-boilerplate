"use client"

import { Button } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [open, setOpen] = useState(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)
  const pathname = usePathname()

  // Auto-open the drawer when an item is added (unless we're on the cart page).
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      setOpen(true)
    }
    itemRef.current = totalItems
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems])

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="h-full flex items-center">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open cart"
        data-testid="nav-cart-link"
        className="h-full flex items-center"
      >
        <span className="hidden small:inline-block font-sans text-yco-charcoal text-xs font-bold tracking-[0.14em] uppercase hover:text-yco-coral transition-colors duration-300">
          Cart ({totalItems})
        </span>
        <span className="small:hidden relative text-yco-charcoal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
          </svg>
          <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-circle bg-yco-charcoal px-1 text-[10px] font-bold text-white">
            {totalItems}
          </span>
        </span>
      </button>

      {/* Drawer overlay */}
      <div
        className={`fixed inset-0 z-[70] ${open ? "visible" : "invisible"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <div
          data-testid="nav-cart-dropdown"
          className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-yco-cream-dark px-6 py-5">
            <h3 className="font-sans text-yco-charcoal text-sm font-bold uppercase tracking-[0.18em]">
              Cart ({totalItems})
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close cart"
              className="text-yco-charcoal-muted hover:text-yco-charcoal transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {cartState && cartState.items?.length ? (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-6 grid grid-cols-1 gap-y-7 no-scrollbar">
                {cartState.items
                  .sort((a, b) =>
                    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  )
                  .map((item) => (
                    <div
                      className="grid grid-cols-[100px_1fr] gap-x-4"
                      key={item.id}
                      data-testid="cart-item"
                    >
                      <LocalizedClientLink
                        href={`/products/${item.variant?.product?.handle}`}
                        className="w-24"
                        onClick={() => setOpen(false)}
                      >
                        <Thumbnail
                          thumbnail={item.variant?.product?.thumbnail}
                          images={item.variant?.product?.images}
                          size="square"
                        />
                      </LocalizedClientLink>
                      <div className="flex flex-col justify-between flex-1">
                        <div className="flex flex-col flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[160px]">
                              <h3 className="text-sm font-bold text-yco-charcoal overflow-hidden text-ellipsis">
                                <LocalizedClientLink
                                  href={`/products/${item.variant?.product?.handle}`}
                                  data-testid="product-link"
                                  onClick={() => setOpen(false)}
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h3>
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                                data-value={item.variant}
                              />
                              <span
                                className="text-yco-charcoal-muted text-xs mt-1"
                                data-testid="cart-item-quantity"
                                data-value={item.quantity}
                              >
                                Quantity: {item.quantity}
                              </span>
                            </div>
                            <div className="flex justify-end text-yco-charcoal text-sm">
                              <LineItemPrice item={item} style="tight" />
                            </div>
                          </div>
                        </div>
                        <DeleteButton
                          id={item.id}
                          className="mt-1 text-yco-charcoal-muted text-xs"
                          data-testid="cart-item-remove-button"
                        >
                          Remove
                        </DeleteButton>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="border-t border-yco-cream-dark px-6 py-6 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-yco-charcoal text-sm font-bold uppercase tracking-[0.12em]">
                    Subtotal
                  </span>
                  <span
                    className="font-sans text-yco-charcoal text-base font-bold"
                    data-testid="cart-subtotal"
                    data-value={subtotal}
                  >
                    {convertToLocale({
                      amount: subtotal,
                      currency_code: cartState.currency_code,
                    })}
                  </span>
                </div>
                <LocalizedClientLink href="/cart" passHref onClick={() => setOpen(false)}>
                  <Button
                    className="w-full rounded-circle"
                    size="large"
                    variant="secondary"
                    data-testid="go-to-cart-button"
                  >
                    View cart
                  </Button>
                </LocalizedClientLink>
                <LocalizedClientLink href="/checkout?step=address" passHref onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-circle" size="large">
                    Checkout
                  </Button>
                </LocalizedClientLink>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col gap-y-5 items-center justify-center px-6 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-circle bg-yco-panel text-yco-charcoal text-sm font-bold">
                0
              </div>
              <span className="font-sans text-yco-charcoal text-sm">
                Your shopping bag is empty.
              </span>
              <LocalizedClientLink href="/store" onClick={() => setOpen(false)}>
                <Button className="rounded-circle" variant="secondary">
                  Explore products
                </Button>
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartDropdown
