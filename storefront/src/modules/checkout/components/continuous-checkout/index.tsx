"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading } from "@medusajs/ui"
import { unstable_rethrow } from "next/navigation"
import { completeCodCheckout, prepareCheckout } from "@lib/data/checkout"
import CartTotals from "@modules/common/components/cart-totals"
import ShippingAddress from "../shipping-address"

const serialize = (form: FormData) => JSON.stringify(Array.from(form.entries()))

export default function ContinuousCheckout({
  cart,
  customer,
  children,
}: {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}) {
  // Server refreshes must never replace an address the customer is still typing.
  const [initialCart] = useState(cart)
  const formId = useId()
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
    } catch (error) {
      // A successful Server Action redirect rejects its client-side promise.
      // Preserve that framework signal so it cannot flash as a checkout error.
      unstable_rethrow(error)
      setError("Porosia nuk u përfundua. Ju lutemi provoni përsëri.")
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div
      className="bg-white rounded-large border border-yco-cream-dark p-5 small:p-8"
      data-testid="continuous-checkout"
    >
      <form
        id={formId}
        ref={formRef}
        onChange={markDirty}
        onSubmit={handleSubmit}
      >
        <fieldset disabled={submitting} className="min-w-0">
          <Heading level="h2" className="text-3xl-regular mb-5">
            Të dhënat tuaja
          </Heading>
          <ShippingAddress
            cart={initialCart}
            customer={customer}
            checked
            onChange={() => {}}
            onValuesChange={markDirty}
            compact
          />
        </fieldset>
      </form>

      <section
        className="mt-8 border-t border-yco-cream-dark pt-6"
        aria-label="Përmbledhja e porosisë"
      >
        <fieldset disabled={submitting} className="min-w-0">
          {children}
        </fieldset>
        <div className="mt-5" aria-live="polite" aria-busy={updating}>
          <CartTotals
            totals={quote?.cart ?? cart}
            pendingLabel={
              !quote
                ? updating
                  ? "Duke përditësuar…"
                  : error
                  ? "Dërgesa nuk u llogarit"
                  : "Plotësoni qytetin"
                : undefined
            }
          />
        </div>
        <p
          className="text-sm text-yco-charcoal-muted mb-5"
          data-testid="payment-method-summary"
        >
          Pagesa në dorëzim (COD)
        </p>
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
          form={formId}
          type="submit"
          disabled={!quote || updating || submitting}
          isLoading={submitting}
          className="yco-btn yco-btn--coral w-full"
          data-testid="submit-order-button"
        >
          Përfundo porosinë
        </Button>
      </section>
    </div>
  )
}
