"use client"

import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { HttpTypes } from "@medusajs/types"

import { getProductPrice } from "@lib/util/get-product-price"
import ShowcaseCard, { type ShowcaseProduct } from "../showcase-card"

const ArrowIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d={direction === "left" ? "M15 8l-4 4 4 4" : "M9 8l4 4-4 4"}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function ProductRail({
  products,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  const wheelGestures = useMemo(
    () => [WheelGesturesPlugin({ forceWheelAxis: "x" })],
    []
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      dragFree: true,
    },
    wheelGestures
  )
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = useCallback(() => {
    if (!emblaApi) {
      return
    }

    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    updateScrollState()

    emblaApi.on("select", updateScrollState)
    emblaApi.on("reInit", updateScrollState)

    return () => {
      emblaApi.off("select", updateScrollState)
      emblaApi.off("reInit", updateScrollState)
    }
  }, [emblaApi, updateScrollState])

  const scrollProducts = (direction: "prev" | "next") => {
    if (!emblaApi) {
      return
    }

    direction === "prev" ? emblaApi.scrollPrev() : emblaApi.scrollNext()
  }

  if (!products.length) {
    return null
  }

  // Prices are already on the products (fetched with *variants.calculated_price),
  // so the cards receive plain serializable data — no per-card refetch.
  const showcaseProducts: ShowcaseProduct[] = products
    .slice(0, 8)
    .map((product) => {
      const { cheapestPrice } = getProductPrice({ product })
      const gallery = (product.images ?? []).map((image) => image.url)
      const hoverImage =
        gallery.find((url) => url && url !== product.thumbnail) ?? null

      return {
        id: product.id!,
        handle: product.handle!,
        title: product.title,
        thumbnail: product.thumbnail || gallery[0] || null,
        hoverImage,
        price: cheapestPrice?.calculated_price ?? null,
        originalPrice: cheapestPrice?.original_price ?? null,
        isSale: cheapestPrice?.price_type === "sale",
      }
    })

  return (
    <div className="relative mx-auto max-w-6xl pb-8 small:pb-10">
      <div
        ref={emblaRef}
        className="-mx-6 overflow-hidden px-6 pb-3 md:-mx-8 md:px-8"
        role="region"
        aria-label="Bestsellers"
      >
        <div className="flex gap-3">
          {showcaseProducts.map((product, productIndex) => (
            <div
              key={product.id}
              className="w-[62%] min-w-[10rem] max-w-[15rem] shrink-0 xsmall:w-[44%] small:w-[19%]"
            >
              <ShowcaseCard product={product} priority={productIndex < 2} />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between md:flex">
        <button
          type="button"
          onClick={() => scrollProducts("prev")}
          disabled={!canScrollPrev}
          aria-label="Produktet e mëparshme"
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/85 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollProducts("next")}
          disabled={!canScrollNext}
          aria-label="Produktet e radhës"
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/85 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </div>
  )
}
