"use client"

import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type ShowcaseProduct = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  hoverImage: string | null
  price: string | null
  originalPrice: string | null
  isSale: boolean
}

/** Homepage bestseller card: second-image crossfade on hover, visible focus
    ring, and a quick-view arrow that slides in. */
export default function ShowcaseCard({
  product,
  priority = false,
}: {
  product: ShowcaseProduct
  priority?: boolean
}) {
  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block rounded-large outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2"
      aria-label={`${product.title}${product.price ? `, ${product.price}` : ""}`}
    >
      <div className="relative aspect-[11/14] overflow-hidden rounded-large bg-yco-panel">
        {product.thumbnail ? (
          <>
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              draggable={false}
              sizes="(max-width: 576px) 70vw, (max-width: 1024px) 42vw, 240px"
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
                sizes="(max-width: 576px) 70vw, (max-width: 1024px) 42vw, 240px"
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

        <span
          aria-hidden
          className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-circle bg-white/90 text-yco-charcoal opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 8l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-sans text-sm leading-snug text-yco-charcoal">
          {product.title}
        </h3>
        {product.price && (
          <p className="shrink-0 text-right font-sans text-sm font-bold text-yco-charcoal">
            {product.isSale && product.originalPrice && (
              <span className="mr-2 font-normal text-yco-charcoal-muted line-through">
                {product.originalPrice}
              </span>
            )}
            <span
              className={product.isSale ? "text-pastel-coral-ink" : undefined}
            >
              {product.price}
            </span>
          </p>
        )}
      </div>
    </LocalizedClientLink>
  )
}
