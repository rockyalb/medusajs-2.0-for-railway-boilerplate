"use client"

import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { motion, useReducedMotion } from "motion/react"
import { useMemo, useRef } from "react"
import type { HttpTypes } from "@medusajs/types"
import type { MouseEvent, PointerEvent } from "react"
import type { CategoryProduct } from "./category-product-slider"

type CategoryCard = {
  category: HttpTypes.StoreProductCategory
  products: CategoryProduct[]
}

const DRAG_THRESHOLD = 14

const CATEGORY_CARD_ACCENT_CLASS = "yco-accent--rhode"

export default function CategoryGrid({
  categories,
}: {
  categories: CategoryCard[]
}) {
  const reducedMotion = useReducedMotion()
  const wheelGestures = useMemo(
    () => [WheelGesturesPlugin({ forceWheelAxis: "x" })],
    []
  )
  const [emblaRef] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      dragFree: true,
    },
    wheelGestures
  )
  const dragState = useRef({
    active: false,
    dragged: false,
    suppressClick: false,
    startX: 0,
  })

  if (!categories.length) {
    return null
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragState.current = {
      active: true,
      dragged: false,
      suppressClick: false,
      startX: event.clientX,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragState.current

    if (!state.active) {
      return
    }

    const deltaX = event.clientX - state.startX

    if (Math.abs(deltaX) <= DRAG_THRESHOLD) {
      return
    }

    if (!state.dragged) {
      state.dragged = true
      state.suppressClick = true
    }
  }

  const endDrag = () => {
    const state = dragState.current

    if (!state.active) {
      return
    }

    state.active = false

    if (state.suppressClick) {
      window.setTimeout(() => {
        state.suppressClick = false
        state.dragged = false
      }, 120)
    }
  }

  const handleCategoryClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (dragState.current.suppressClick) {
      event.preventDefault()
    }
  }

  return (
    <section className="yco-section font-hanken bg-white/40 px-6 pb-8 pt-12 small:pb-10 small:pt-16">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto"
      >
        <h2 className="yco-section-title rhode-display mb-6 text-3xl md:text-4xl">
          Kategoritë
        </h2>

        <div
          ref={emblaRef}
          className="-mx-6 cursor-grab overflow-hidden px-6 pb-3 active:cursor-grabbing small:mx-0 small:px-0"
          role="region"
          aria-label="Kategoritë e produkteve"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          <div className="flex gap-4">
            {categories.map(({ category, products }, index) => {
              const image = products[0]?.image

              return (
                <div
                  key={category.id}
                  className="w-[78vw] max-w-[25rem] shrink-0 small:w-[calc((100%_-_2rem)/3)]"
                >
                  <Link
                    href={`/categories/${category.handle}`}
                    className={`group ${CATEGORY_CARD_ACCENT_CLASS} yco-accent-card yco-home-category-card relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-large p-5 outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2`}
                    aria-label={`Bli ${category.name}`}
                    draggable={false}
                    onClick={handleCategoryClick}
                  >
                    {category.description && (
                      <p className="max-w-[17rem] font-hanken text-xs leading-relaxed text-yco-charcoal-muted">
                        {category.description}
                      </p>
                    )}

                    <div className="my-6 aspect-[4/3] overflow-hidden rounded-rounded bg-white/55">
                      {image ? (
                        <img
                          src={image}
                          alt={products[0]?.title || category.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading={index > 1 ? "lazy" : undefined}
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-hanken text-6xl font-black lowercase text-yco-charcoal/20">
                          {category.name.slice(0, 1)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="font-hanken text-yco-charcoal text-sm font-bold">
                          {category.name}
                        </div>
                        <p className="mt-1 font-hanken text-xs text-yco-charcoal-muted">
                          Shfleto kategorinë
                        </p>
                      </div>
                      <span className="rhode-round-btn rhode-round-btn--accent shrink-0">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M9 8l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
