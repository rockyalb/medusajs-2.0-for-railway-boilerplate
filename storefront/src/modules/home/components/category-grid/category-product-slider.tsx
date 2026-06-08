"use client"

import Link from "next/link"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import type { WheelEvent } from "react"

export type CategoryProduct = {
  id: string
  title: string
  handle: string
  image: string
}

type CategoryProductSliderProps = {
  products: CategoryProduct[]
  countryCode: string
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
  countryCode,
  categoryName,
  cardIndex,
}: CategoryProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current

    if (!element) {
      return
    }

    setCanScrollPrev(element.scrollLeft > 4)
    setCanScrollNext(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 4
    )
  }, [])

  useEffect(() => {
    updateScrollState()

    const element = scrollRef.current

    if (!element) {
      return
    }

    element.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)

    return () => {
      element.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [updateScrollState])

  const scrollProducts = (direction: "prev" | "next") => {
    const element = scrollRef.current

    if (!element) {
      return
    }

    element.scrollBy({
      left:
        direction === "prev"
          ? -element.clientWidth * 0.78
          : element.clientWidth * 0.78,
      behavior: "smooth",
    })
  }

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const element = scrollRef.current

    if (!element || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return
    }

    const scrollingPrev = event.deltaY < 0
    const scrollingNext = event.deltaY > 0

    if ((scrollingPrev && canScrollPrev) || (scrollingNext && canScrollNext)) {
      event.preventDefault()
      element.scrollLeft += event.deltaY
    }
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="-mx-6 mt-8 overflow-x-auto px-6 pb-3 no-scrollbar md:-mx-8 md:px-8"
        role="region"
        aria-label={`${categoryName} products`}
        onWheel={handleWheel}
      >
        <div className="flex snap-x snap-mandatory gap-3">
          {products.slice(0, 8).map((product, productIndex) => (
            <Link
              key={product.id}
              href={`/${countryCode}/products/${product.handle}`}
              className="group/product w-[68%] min-w-[12rem] max-w-[15rem] shrink-0 snap-start rounded-rounded bg-white/70 p-3 transition-transform duration-300 hover:-translate-y-1 sm:w-[54%] lg:w-[72%]"
            >
              <div className="relative aspect-square overflow-hidden rounded-base bg-white">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/product:scale-[1.04]"
                    fill
                    sizes="(min-width: 1024px) 180px, (min-width: 640px) 216px, 68vw"
                    loading={
                      cardIndex > 1 || productIndex > 1 ? "lazy" : undefined
                    }
                    priority={cardIndex <= 1 && productIndex <= 1}
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
          aria-label={`Previous ${categoryName} products`}
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/85 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollProducts("next")}
          disabled={!canScrollNext}
          aria-label={`Next ${categoryName} products`}
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/85 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </div>
  )
}
