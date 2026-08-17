"use client"

import { Check, Plus } from "@medusajs/icons"
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

/** Unified product card: a tall, image-led canvas with price and purchase
    action combined into one compact pill. Used by the homepage rail and the
    store/related-product grids. */
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

  // Single-variant products add straight to the cart. Multi-variant products
  // use a link in the same position so options get picked on the product page.
  const handleQuickAdd = async () => {
    if (!product.variantId || !product.inStock || isAdding) {
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

  const priceContent = product.price ? (
    <span className="min-w-0 text-left font-hanken leading-none">
      <span
        className="block truncate text-sm font-bold tracking-tight"
        data-testid="price"
      >
        {product.price}
      </span>
      {product.isSale && product.originalPrice && (
        <span
          className="mt-1 block truncate text-[10px] font-medium text-white/60 line-through"
          data-testid="original-price"
        >
          {product.originalPrice}
        </span>
      )}
    </span>
  ) : (
    <span className="truncate font-sans text-xs font-semibold">
      {product.variantId ? "Shto në shportë" : "Shiko produktin"}
    </span>
  )

  const actionIcon = (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-circle bg-white/10">
      {isAdding ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-circle border-2 border-current border-t-transparent motion-reduce:animate-none" />
      ) : justAdded ? (
        <Check />
      ) : (
        <Plus />
      )}
    </span>
  )

  const actionClassName =
    "absolute inset-x-3 bottom-3 z-10 flex min-h-11 items-center justify-between gap-3 rounded-circle bg-yco-charcoal px-3 py-2 text-white shadow-[0_2px_8px_rgba(47,45,41,0.20)] outline-none transition-[transform,background-color] duration-200 hover:bg-yco-coral focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-large border border-yco-cream-dark bg-white/75 shadow-[0_1px_2px_rgba(36,33,30,0.04)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-yco-charcoal/25 hover:shadow-[0_4px_8px_rgba(47,45,41,0.08)] motion-reduce:transform-none motion-reduce:transition-none"
      data-testid="product-wrapper"
    >
      <div className="relative">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yco-charcoal"
          aria-label={`${product.title}${
            product.price ? `, ${product.price}` : ""
          }`}
        >
          <div
            className={`relative overflow-hidden bg-yco-panel ${
              featured ? "aspect-[3/4]" : "aspect-[2/3] small:aspect-[3/4]"
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
                  className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none ${
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
                    className="scale-[1.035] object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100 motion-reduce:transform-none motion-reduce:transition-none"
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
        </LocalizedClientLink>

        {product.variantId ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!product.inStock || isAdding}
            aria-label={
              justAdded
                ? "U shtua në shportë"
                : product.inStock
                ? `Shto ${product.title} në shportë`
                : `${product.title} nuk ka stok`
            }
            data-testid="quick-add-button"
            className={`${actionClassName} disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-yco-charcoal`}
          >
            {priceContent}
            {actionIcon}
          </button>
        ) : (
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            aria-label={`Zgjidh opsionet për ${product.title}`}
            data-testid="quick-add-button"
            className={actionClassName}
          >
            {priceContent}
            {actionIcon}
          </LocalizedClientLink>
        )}
      </div>

      <div className="flex flex-1 border-t border-yco-cream-dark px-3 py-3 small:px-4">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="block self-start rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2"
        >
          {/* Titles use only the space they need. Rare titles that overflow
              two rows switch into a compact marquee. */}
          <h3
            ref={titleRef}
            className={`font-sans text-sm leading-snug text-yco-charcoal ${
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
        </LocalizedClientLink>
      </div>
    </article>
  )
}
