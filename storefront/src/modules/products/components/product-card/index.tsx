"use client"

import { Check, ShoppingBag } from "@medusajs/icons"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { addToCart } from "@lib/data/cart"
import { buildMetaContents, trackMetaEvent } from "@lib/meta-pixel"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type ProductCardData = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  hoverImage: string | null
  price: string | null
  originalPrice: string | null
  isSale: boolean
  /** Quick-add target; null when the product needs option selection first. */
  variantId: string | null
  inStock: boolean
  priceAmount: number | null
  currencyCode: string | null
}

/** Unified product card: frosted surface with a hairline border, warm-gray
    image well, divided info footer, and a soft lift + second-image crossfade
    on hover. Used by the homepage rail and the store/related-product grids. */
export default function ProductCard({
  product,
  priority = false,
  featured = false,
}: {
  product: ProductCardData
  priority?: boolean
  featured?: boolean
}) {
  const countryCode = useParams().countryCode as string
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  // Titles wrap onto two rows; only the rare title that overflows even two
  // rows switches into the sliding-marquee mode, which needs a measurement.
  // In marquee mode the text is duplicated for a seamless loop, so overflow
  // is judged from the first copy's width instead of the h3's scrollWidth.
  const titleRef = useRef<HTMLHeadingElement>(null)
  const marqueeCopyRef = useRef<HTMLSpanElement>(null)
  const [needsMarquee, setNeedsMarquee] = useState(false)

  useEffect(() => {
    const el = titleRef.current
    if (!el) {
      return
    }

    const check = () => {
      setNeedsMarquee((prev) =>
        prev
          ? (marqueeCopyRef.current?.offsetWidth ?? 0) > el.clientWidth
          : el.scrollHeight > el.clientHeight + 1
      )
    }

    check()

    // The clamped box keeps the same outer size when the webfont swaps in
    // and reflows the text, so ResizeObserver alone misses it — re-measure
    // once fonts settle.
    document.fonts?.ready.then(check).catch(() => {})

    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const canQuickAdd = !!product.variantId && product.inStock

  // Single-variant products add straight to the cart; multi-variant products
  // fall through to the card link so options get picked on the product page.
  const handleQuickAdd = async (e: React.MouseEvent) => {
    if (!product.variantId) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    if (!product.inStock || isAdding) {
      return
    }

    setIsAdding(true)

    try {
      await addToCart({
        variantId: product.variantId,
        quantity: 1,
        countryCode,
      })

      trackMetaEvent("AddToCart", {
        content_ids: [product.variantId],
        content_name: product.title,
        content_type: "product",
        contents: buildMetaContents([
          {
            id: product.variantId,
            item_price: product.priceAmount ?? undefined,
            quantity: 1,
          },
        ]),
        currency: product.currencyCode?.toUpperCase(),
        value: product.priceAmount ?? undefined,
      })

      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full rounded-large outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2"
      aria-label={`${product.title}${
        product.price ? `, ${product.price}` : ""
      }`}
      data-testid="product-wrapper"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-large border border-white/60 bg-white/60 backdrop-blur-[6px] shadow-[0_1px_2px_rgba(36,33,30,0.04)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-yco-charcoal/25 group-hover:shadow-[0_24px_44px_-26px_rgba(47,45,41,0.45)]">
        <div
          className={`relative overflow-hidden bg-yco-panel ${
            featured ? "aspect-[11/14]" : "aspect-[3/4]"
          }`}
        >
          {product.thumbnail ? (
            <>
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                draggable={false}
                sizes="(max-width: 576px) 70vw, (max-width: 1024px) 42vw, 300px"
                className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] ${
                  product.hoverImage ? "group-hover:opacity-0" : ""
                }`}
                priority={priority}
              />
              {product.hoverImage && (
                <Image
                  src={product.hoverImage}
                  alt=""
                  fill
                  draggable={false}
                  sizes="(max-width: 576px) 70vw, (max-width: 1024px) 42vw, 300px"
                  className="scale-[1.05] object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center font-sans text-5xl font-black lowercase text-yco-charcoal/15">
              {product.title.slice(0, 1)}
            </div>
          )}

          {product.isSale && (
            <span className="absolute left-3 top-3 rounded-circle bg-pastel-coral-soft px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-pastel-coral-ink">
              Sale
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col border-t border-yco-cream-dark px-4 pb-4 pt-3">
          {/* min-h reserves two rows (2 × leading-snug) so clamp and marquee
              modes render the same footer height. Marquee mode duplicates the
              title and slides by one copy per cycle — a continuous
              left-to-right ticker loop, faded at both clipped edges. */}
          <h3
            ref={titleRef}
            className={`min-h-[2.75em] font-sans text-sm leading-snug text-yco-charcoal ${
              needsMarquee
                ? "overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]"
                : "line-clamp-2"
            }`}
            data-testid="product-title"
          >
            {needsMarquee ? (
              <span className="yco-card-title-marquee inline-block">
                <span ref={marqueeCopyRef} className="inline-block pr-8">
                  {product.title}
                </span>
                <span aria-hidden className="inline-block pr-8">
                  {product.title}
                </span>
              </span>
            ) : (
              <span>{product.title}</span>
            )}
          </h3>
          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            {product.price ? (
              <p className="font-hanken text-sm font-bold tracking-tight text-yco-charcoal">
                {product.isSale && product.originalPrice && (
                  <span
                    className="mr-2 font-normal text-yco-charcoal-muted line-through"
                    data-testid="original-price"
                  >
                    {product.originalPrice}
                  </span>
                )}
                <span
                  className={
                    product.isSale ? "text-pastel-coral-ink" : undefined
                  }
                  data-testid="price"
                >
                  {product.price}
                </span>
              </p>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!!product.variantId && !product.inStock}
              aria-label={
                justAdded
                  ? "U shtua në shportë"
                  : canQuickAdd
                  ? "Shto në shportë"
                  : product.variantId
                  ? "Nuk ka stok"
                  : "Zgjidh opsionet"
              }
              data-testid="quick-add-button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/85 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/85 disabled:hover:text-yco-charcoal"
            >
              {isAdding ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : justAdded ? (
                <Check />
              ) : (
                <ShoppingBag />
              )}
            </button>
          </div>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
