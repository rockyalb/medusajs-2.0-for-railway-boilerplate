"use client"

import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useCallback, useEffect, useMemo, useState } from "react"

import { BRAND_LOGOS } from "@lib/data/brand-logos"

type BrandCollection = Pick<
  HttpTypes.StoreCollection,
  "id" | "title" | "handle"
>

const ArrowIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d={direction === "left" ? "M15 8l-4 4 4 4" : "M9 8l4 4-4 4"}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function FeaturedBrands({
  brands,
}: {
  brands: BrandCollection[]
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

  const scrollBrands = (direction: "prev" | "next") => {
    if (!emblaApi) {
      return
    }

    direction === "prev" ? emblaApi.scrollPrev() : emblaApi.scrollNext()
  }

  if (!brands.length) {
    return null
  }

  // Full literal class names so Tailwind keeps these hand-written @layer rules.
  const accentClasses = [
    "yco-accent--mint",
    "yco-accent--coral",
    "yco-accent--blue",
  ] as const

  return (
    <section className="yco-section bg-yco-cream-dark/50 px-6 py-10 small:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="font-hanken text-center mb-7 small:mb-8">
          <h2 className="yco-section-title yco-section-title--center text-yco-charcoal text-2xl md:text-3xl">
            Brende që u besojmë
          </h2>
          <p className="font-sans text-yco-charcoal-muted text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Çdo brend përzgjidhet me kujdes për cilësinë, etikën dhe
            përkushtimin ndaj qëndrueshmërisë.
          </p>
        </div>

        <div className="relative">
          <div
            ref={emblaRef}
            className="-mx-6 overflow-hidden px-6 pb-3 small:-mx-8 small:px-8"
            role="region"
            aria-label="Brendet që u besojmë"
          >
            <div role="list" className="flex gap-4">
              {brands.map((brand, index) => {
                const logo = brand.handle
                  ? BRAND_LOGOS[brand.handle]
                  : undefined
                const accentClass = accentClasses[index % accentClasses.length]

                return (
                  <div
                    key={brand.id}
                    role="listitem"
                    className="w-[42vw] min-w-[9.5rem] max-w-[12rem] shrink-0 small:w-[calc((100%_-_5rem)_/_6)] small:min-w-0 small:max-w-none"
                  >
                    <Link
                      href={`/collections/${brand.handle}`}
                      className={`group ${accentClass} flex h-full flex-col rounded-2xl border border-yco-cream-dark/40 bg-yco-cream p-3 outline-none transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-[0_20px_42px_-20px_var(--accent-glow)] focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none`}
                    >
                      <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-large bg-white p-5">
                        {logo ? (
                          <img
                            src={logo}
                            alt={`${brand.title} logo`}
                            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="font-serif text-3xl font-medium text-yco-charcoal">
                              {brand.title[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mb-1 text-center font-serif text-sm font-semibold leading-tight text-yco-charcoal">
                        {brand.title}
                      </div>
                      <div className="text-center font-sans text-[10px] leading-snug tracking-wide text-yco-charcoal-muted">
                        Shfleto brendin
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between small:flex">
            <button
              type="button"
              onClick={() => scrollBrands("prev")}
              disabled={!canScrollPrev}
              aria-label="Brendet e mëparshme"
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/90 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => scrollBrands("next")}
              disabled={!canScrollNext}
              aria-label="Brendet e radhës"
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-circle border border-yco-charcoal/30 bg-white/90 text-yco-charcoal shadow-sm transition-all hover:bg-yco-charcoal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/collections"
            className="font-sans text-yco-charcoal text-xs tracking-[0.2em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-pastel-coral-ink hover:border-pastel-coral-ink active:scale-95 transition-all duration-300 inline-block"
          >
            Shiko të gjitha brendet
          </Link>
        </div>
      </div>
    </section>
  )
}
