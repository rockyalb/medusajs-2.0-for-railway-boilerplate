"use client"

import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useCallback, useEffect, useMemo, useState } from "react"

export type CategoryProduct = {
  id: string
  title: string
  handle: string
  image: string
}

type CategoryProductSliderProps = {
  products: CategoryProduct[]
  categoryName: string
  cardIndex: number
}

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

export default function CategoryProductSlider({
  products,
  categoryName,
  cardIndex,
}: CategoryProductSliderProps) {
  const wheelGestures = useMemo(
    () => [WheelGesturesPlugin({ forceWheelAxis: "x" })],
    []
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
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

  return (
    <div className="relative">
      <div
        ref={emblaRef}
        className="-mx-6 mt-8 overflow-hidden px-6 pb-3 md:-mx-8 md:px-8"
        role="region"
        aria-label={`${categoryName} produkte`}
      >
        <div className="flex gap-3">
          {products.slice(0, 8).map((product, productIndex) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="group/product w-[68%] min-w-[12rem] max-w-[15rem] shrink-0 rounded-rounded bg-white/70 p-3 transition-transform duration-300 hover:-translate-y-1 sm:w-[54%] lg:w-[72%]"
            >
              <div className="aspect-square overflow-hidden rounded-base bg-white">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/product:scale-[1.04]"
                    loading={
                      cardIndex > 1 || productIndex > 1 ? "lazy" : undefined
                    }
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-sans text-5xl font-black lowercase text-yco-charcoal/20">
                    {product.title.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="mt-3 line-clamp-2 min-h-[2rem] font-sans text-xs font-bold uppercase leading-tight tracking-[0.06em] text-yco-charcoal">
                {product.title}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 mt-8 hidden items-center justify-between md:flex">
        <button
          type="button"
          onClick={() => scrollProducts("prev")}
          disabled={!canScrollPrev}
          aria-label={`Produktet e mëparshme për ${categoryName}`}
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/85 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollProducts("next")}
          disabled={!canScrollNext}
          aria-label={`Produktet e radhës për ${categoryName}`}
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/85 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </div>
  )
}
