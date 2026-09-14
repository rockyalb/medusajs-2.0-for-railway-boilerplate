"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { lockPageScroll } from "@lib/util/lock-page-scroll"

import { deleteLineItem, updateLineItem } from "@lib/data/cart-client"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import FreeShippingProgress from "@modules/common/components/free-shipping-progress"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuantityStepper from "@modules/common/components/quantity-stepper"
import Thumbnail from "@modules/products/components/thumbnail"
import {
  BagIcon,
  CartBadge,
  cartButtonClass,
  cartLabelClass,
} from "@modules/layout/components/header-controls"

const DropdownItem = ({
  item,
  onNavigate,
}: {
  item: HttpTypes.StoreCartLineItem
  onNavigate: () => void
}) => {
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({ lineId: item.id, quantity })
      .catch((err) => setError(err.message))
      .finally(() => setUpdating(false))
  }

  const removeItem = async () => {
    setError(null)
    setRemoving(true)

    await deleteLineItem(item.id).catch((err) => {
      setError(err.message)
      setRemoving(false)
    })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQuantity = 10

  return (
    <div
      className={`grid shrink-0 grid-cols-[92px_1fr] gap-x-4 rounded-large border border-yco-cream-dark bg-yco-panel/70 p-3 transition-opacity ${
        removing ? "opacity-50" : "opacity-100"
      }`}
      data-testid="cart-item"
    >
      <LocalizedClientLink
        href={`/products/${item.variant?.product?.handle}`}
        className="w-24"
        onClick={onNavigate}
      >
        <Thumbnail
          thumbnail={item.variant?.product?.thumbnail}
          images={item.variant?.product?.images}
          size="square"
        />
      </LocalizedClientLink>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <h3 className="text-sm font-bold text-yco-charcoal overflow-hidden text-ellipsis">
              <LocalizedClientLink
                href={`/products/${item.variant?.product?.handle}`}
                data-testid="product-link"
                onClick={onNavigate}
              >
                {item.title}
              </LocalizedClientLink>
            </h3>
            <LineItemOptions
              variant={item.variant}
              data-testid="cart-item-variant"
              data-value={item.variant}
            />
          </div>
          <button
            type="button"
            onClick={removeItem}
            disabled={removing}
            aria-label={`Hiq ${item.title} nga shporta`}
            data-testid="cart-item-remove-button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-circle text-yco-charcoal-muted transition-colors hover:bg-white hover:text-yco-charcoal disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal"
          >
            {removing ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div
            className="flex items-center gap-2"
            data-testid="cart-item-quantity"
            data-value={item.quantity}
          >
            <QuantityStepper
              quantity={item.quantity}
              onChange={changeQuantity}
              max={maxQuantity}
              disabled={updating || removing}
              size="compact"
            />
            {updating && (
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-yco-charcoal-muted border-t-transparent"
                aria-label={"Duke p\u00ebrdit\u00ebsuar sasin\u00eb"}
              />
            )}
          </div>
          <div className="flex justify-end text-yco-charcoal text-sm">
            <LineItemPrice item={item} style="tight" />
          </div>
        </div>

        {error && (
          <p
            className="mt-2 font-sans text-xs text-pastel-coral-ink"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

const CartDropdown = ({
  cart: cartState,
  loaded = true,
  error = false,
  openVersion = 0,
  onRefresh,
}: {
  cart?: HttpTypes.StoreCart | null
  loaded?: boolean
  error?: boolean
  openVersion?: number
  onRefresh?: () => void
}) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const subtotal = cartState?.subtotal ?? 0
  const openRef = useRef(openVersion)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Opening is tied to a successful add, not loading a returning shopper's cart.
  useEffect(() => {
    if (openRef.current !== openVersion && !pathname.includes("/cart")) {
      setOpen(true)
    }
    openRef.current = openVersion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openVersion])

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return
    const unlock = lockPageScroll()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => {
      unlock()
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const drawer = (
    <div
      className={`fixed inset-x-0 top-0 z-[120] h-dvh overflow-hidden overscroll-none ${
        open ? "visible" : "invisible pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 touch-none bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        data-testid="nav-cart-dropdown"
        className={`absolute right-0 top-0 flex h-full min-h-0 w-full max-w-[440px] flex-col overflow-hidden overscroll-none bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-yco-cream-dark px-6 py-5">
          <h3 className="font-sans text-yco-charcoal text-sm font-bold uppercase tracking-[0.18em]">
            Shporta ({totalItems})
          </h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={"Mbyll shport\u00ebn"}
            className="text-yco-charcoal-muted hover:text-yco-charcoal transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {!loaded ? (
          <div className="flex flex-1 items-center justify-center px-6 text-sm" role="status">
            {error ? <button type="button" onClick={onRefresh}>Provo përsëri</button> : "Duke ngarkuar shportën…"}
          </div>
        ) : cartState && cartState.items?.length ? (
          <>
            <div className="shrink-0 border-b border-yco-cream-dark px-6 py-5">
              <FreeShippingProgress
                subtotal={subtotal}
                currency_code={cartState.currency_code}
                compact
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 flex flex-col content-start gap-y-5 no-scrollbar">
              {[...cartState.items]
                .sort((a, b) =>
                  (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                )
                .map((item) => (
                  <DropdownItem
                    key={item.id}
                    item={item}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
            </div>

            <div className="shrink-0 border-t border-yco-cream-dark px-6 py-6 flex flex-col gap-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-yco-charcoal text-sm font-bold uppercase tracking-[0.12em]">
                  {"N\u00ebntotali"}
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
              <LocalizedClientLink
                href="/checkout?step=address"
                passHref
                onClick={() => setOpen(false)}
              >
                <span className="yco-btn yco-btn--coral yco-btn--block">
                  Checkout
                </span>
              </LocalizedClientLink>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col gap-y-5 items-center justify-center px-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-circle bg-yco-panel text-yco-charcoal text-sm font-bold">
              0
            </div>
            <span className="font-sans text-yco-charcoal text-sm">
              {"Shporta juaj \u00ebsht\u00eb bosh."}
            </span>
            <LocalizedClientLink href="/store" onClick={() => setOpen(false)}>
              <span className="yco-btn yco-btn--outline">
                Shfleto produktet
              </span>
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="h-full flex items-center">
        <button
          type="button"
          onClick={() => { setOpen(true); onRefresh?.() }}
          aria-label={`Hap shportën (${totalItems} artikuj)`}
          data-testid="nav-cart-link"
          className={cartButtonClass}
        >
          <span className={cartLabelClass}>Shporta ({totalItems})</span>
          <span className="small:hidden">
            <BagIcon />
          </span>
          <span className="contents small:hidden">
            <CartBadge count={totalItems} />
          </span>
        </button>
      </div>
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  )
}

export default CartDropdown
