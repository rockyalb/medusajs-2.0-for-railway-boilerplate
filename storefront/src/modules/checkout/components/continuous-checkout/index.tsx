"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading } from "@medusajs/ui"
import { completeCodCheckout, prepareCheckout } from "@lib/data/checkout"
import { convertToLocale } from "@lib/util/money"
import compareAddresses from "@lib/util/compare-addresses"
import ShippingAddress from "../shipping-address"
import BillingAddress from "../billing_address"

const serialize = (form: FormData) => JSON.stringify(Array.from(form.entries()))

export default function ContinuousCheckout({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
}) {
  // Server refreshes must never replace an address the customer is still typing.
  const [initialCart] = useState(cart)
  const [sameAsBilling, setSameAsBilling] = useState(
    !cart.billing_address ||
      !cart.shipping_address ||
      compareAddresses(cart.shipping_address, cart.billing_address)
  )
  const formRef = useRef<HTMLFormElement>(null)
  const revision = useRef(0)
  const queue = useRef<Promise<void>>(Promise.resolve())
  const submittingRef = useRef(false)
  const [generation, setGeneration] = useState(0)
  const [quote, setQuote] = useState<{
    cart: HttpTypes.StoreCart
    values: string
  } | null>(null)
  const [updating, setUpdating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const markDirty = useCallback(() => {
    revision.current += 1
    setQuote(null)
    setError(null)
    setGeneration(revision.current)
  }, [])

  // Discounts, credit and item edits elsewhere on the page also invalidate a quote.
  // Exclude shipping/address changes made by this form to avoid a refresh loop.
  const credit = cart as HttpTypes.StoreCart & { credit_line_total?: number }
  const merchandise = JSON.stringify([
    cart.region_id,
    cart.currency_code,
    cart.item_total,
    cart.gift_card_total,
    credit.credit_line_total,
    cart.items?.map((item) => [item.id, item.quantity, item.unit_price]),
    cart.promotions?.map((promotion) => promotion.code),
  ])
  useEffect(() => {
    markDirty()
  }, [merchandise, markDirty])

  useEffect(() => {
    if (submittingRef.current) return
    const form = formRef.current
    if (!form) return
    const data = new FormData(form)
    if (
      !String(data.get("shipping_address.city") ?? "").trim() ||
      !data.get("shipping_address.country_code")
    ) {
      setUpdating(false)
      return
    }
    setUpdating(true)
    const current = revision.current
    const timer = setTimeout(() => {
      // Serialize mutations: discarding a stale response alone cannot prevent an
      // older request from overwriting the address on the server.
      queue.current = queue.current
        .catch(() => {})
        .then(async () => {
          if (current !== revision.current || submittingRef.current) return
          try {
            const latestData = new FormData(form)
            const result = await prepareCheckout(latestData)
            if (current !== revision.current) return
            if (result.cart)
              setQuote({ cart: result.cart, values: serialize(latestData) })
            setError(result.error ?? null)
          } catch {
            if (current === revision.current)
              setError("Dërgesa nuk u përditësua. Ju lutemi provoni përsëri.")
          } finally {
            if (current === revision.current) setUpdating(false)
          }
        })
    }, 600)
    return () => clearTimeout(timer)
  }, [generation])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return
    const form = formRef.current
    if (!form || !form.reportValidity()) return
    const data = new FormData(form)
    if (!quote || serialize(data) !== quote.values) {
      markDirty()
      return
    }
    submittingRef.current = true
    setSubmitting(true)
    setError(null)
    try {
      await queue.current
      const result = await completeCodCheckout(data, {
        total: quote.cart.total ?? 0,
        currency: quote.cart.currency_code,
        shippingOptionId:
          quote.cart.shipping_methods?.at(-1)?.shipping_option_id ?? "",
      })
      if (result.cart) setQuote({ cart: result.cart, values: serialize(data) })
      setError(result.error ?? null)
    } catch {
      setError("Porosia nuk u përfundua. Ju lutemi provoni përsëri.")
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const price = (amount: number) =>
    convertToLocale({
      amount,
      currency_code: quote?.cart.currency_code ?? cart.currency_code,
    })

  return (
    <form
      ref={formRef}
      onChange={markDirty}
      onSubmit={handleSubmit}
      className="bg-white rounded-large border border-yco-cream-dark p-5 small:p-8"
      data-testid="continuous-checkout"
    >
      <fieldset disabled={submitting} className="min-w-0">
        <Heading level="h2" className="text-3xl-regular mb-6">
          Të dhënat tuaja
        </Heading>
        <ShippingAddress
          cart={initialCart}
          customer={customer}
          checked={sameAsBilling}
          onChange={() => {
            setSameAsBilling((value) => !value)
            markDirty()
          }}
          onValuesChange={markDirty}
        />
        {!sameAsBilling && (
          <div className="mt-8">
            <Heading level="h2" className="text-2xl-regular mb-5">
              Adresa e faturimit
            </Heading>
            <BillingAddress cart={initialCart} />
          </div>
        )}
      </fieldset>

      <div className="border-t border-yco-cream-dark mt-6 pt-6 space-y-4">
        <div
          className="flex justify-between gap-4"
          aria-live="polite"
          aria-busy={updating}
        >
          <span>Dërgesa</span>
          <span className="text-right text-sm" data-testid="automatic-shipping">
            {updating
              ? "Duke përditësuar…"
              : quote
              ? price(quote.cart.shipping_total ?? 0)
              : error
              ? "Dërgesa nuk u llogarit"
              : "Plotësoni qytetin dhe shtetin"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Pagesa</span>
          <span className="text-right" data-testid="payment-method-summary">
            Në dorëzim (COD)
          </span>
        </div>
        <p className="text-sm text-yco-charcoal-muted">
          Paguani kur porosia dorëzohet. Dërgesa llogaritet automatikisht sipas
          adresës suaj.
        </p>
      </div>

      <div className="mt-8 border-t border-yco-cream-dark pt-6">
        <div
          className="flex justify-between items-baseline gap-4 mb-5"
          aria-live="polite"
        >
          <span className="font-semibold">Totali për pagesë</span>
          <span
            className="text-xl font-semibold"
            data-testid="checkout-final-total"
          >
            {quote ? price(quote.cart.total ?? 0) : "Duke pritur dërgesën"}
          </span>
        </div>
        <p className="text-sm text-yco-charcoal-muted mb-5">
          Duke klikuar “Përfundo porosinë”, pranoni kushtet e përdorimit,
          kushtet e shitjes, politikën e kthimeve dhe politikën e privatësisë.
        </p>
        {error && (
          <div
            role="alert"
            className="mb-4 text-sm text-red-700"
            data-testid="checkout-error"
          >
            <p>{error}</p>
            {!quote && (
              <button
                type="button"
                disabled={updating || submitting}
                onClick={markDirty}
                className="underline underline-offset-4 min-h-11"
              >
                Provo përsëri
              </button>
            )}
          </div>
        )}
        <Button
          type="submit"
          disabled={!quote || updating || submitting}
          isLoading={submitting}
          className="yco-btn yco-btn--coral w-full"
          data-testid="submit-order-button"
        >
          Përfundo porosinë
        </Button>
      </div>
    </form>
  )
}
