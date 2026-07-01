"use client"

import Link from "next/link"
import { useRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { HttpTypes } from "@medusajs/types"
import type { MouseEvent, PointerEvent, WheelEvent } from "react"
import type { CategoryProduct } from "./category-product-slider"

type CategoryCard = {
  category: HttpTypes.StoreProductCategory
  productCount: number
  products: CategoryProduct[]
}

const DRAG_THRESHOLD = 14

// Full literal class names so Tailwind keeps these hand-written @layer
// component rules (it tree-shakes that layer by scanning source text).
const ACCENT_CLASSES = [
  "yco-accent--mint",
  "yco-accent--coral",
  "yco-accent--blue",
] as const

// Some categories read better in a specific colour.
// Pinned categories win; everything else rotates through the palette.
const accentForCategory = (
  category: HttpTypes.StoreProductCategory,
  index: number
) => {
  const normalized = `${category.name} ${category.handle}`.toLowerCase()
  if (
    normalized.includes("period") ||
    normalized.includes("menstr") ||
    normalized.includes("periudh")
  ) {
    return "yco-accent--coral"
  }
  if (normalized.includes("skin")) {
    return "yco-accent--blue"
  }
  return ACCENT_CLASSES[index % ACCENT_CLASSES.length]
}

export default function CategoryGrid({
  categories,
}: {
  categories: CategoryCard[]
}) {
  const reducedMotion = useReducedMotion()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({
    active: false,
    dragged: false,
    suppressClick: false,
    startX: 0,
    scrollLeft: 0,
  })

  if (!categories.length) {
    return null
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || !scrollerRef.current) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = {
      active: true,
      dragged: false,
      suppressClick: false,
      startX: event.clientX,
      scrollLeft: scrollerRef.current.scrollLeft,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragState.current

    if (!state.active || !scrollerRef.current) {
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

    scrollerRef.current.scrollLeft =
      state.scrollLeft - (deltaX - Math.sign(deltaX) * DRAG_THRESHOLD)
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

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const element = scrollerRef.current

    if (!element || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return
    }

    const canScrollPrev = element.scrollLeft > 0
    const canScrollNext =
      element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    const scrollingPrev = event.deltaY < 0
    const scrollingNext = event.deltaY > 0

    if ((scrollingPrev && canScrollPrev) || (scrollingNext && canScrollNext)) {
      event.preventDefault()
      element.scrollLeft += event.deltaY
    }
  }

  const handleCategoryClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (dragState.current.suppressClick) {
      event.preventDefault()
    }
  }

  return (
    <section className="bg-white px-6 py-10 small:py-12">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="rhode-eyebrow inline-flex items-center gap-2">
              <span className="yco-accent-dot" aria-hidden />
              Bli sipas kategorisë
            </span>
            <h2 className="rhode-display mt-3 text-4xl md:text-5xl">
              kategoritë
            </h2>
            <div className="yco-tricolor-rule mt-4" />
          </div>
          <Link
            href="/store"
            className="hidden font-sans text-xs font-bold uppercase tracking-[0.18em] text-yco-charcoal transition-colors hover:text-pastel-coral-ink small:block"
          >
            Shiko të gjitha
          </Link>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-6 cursor-grab overflow-x-auto overscroll-x-contain px-6 pb-3 no-scrollbar active:cursor-grabbing small:mx-0 small:px-0"
          role="region"
          aria-label="Kategoritë e produkteve"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onWheel={handleWheel}
        >
          <div className="flex gap-4">
            {categories.map(({ category, productCount, products }, index) => {
              const image = products[0]?.image
              const accentClass = accentForCategory(category, index)

              return (
                <div
                  key={category.id}
                  className="w-[78vw] max-w-[25rem] shrink-0 small:w-[calc((100%_-_2rem)/3)]"
                >
                  <Link
                    href={`/categories/${category.handle}`}
                    className={`group ${accentClass} yco-accent-card relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-large p-5 outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2`}
                    aria-label={`Bli ${category.name}`}
                    draggable={false}
                    onClick={handleCategoryClick}
                  >
                    <div>
                      <h3 className="rhode-display text-5xl md:text-6xl">
                        {category.name.toLowerCase()}
                      </h3>
                      {category.description && (
                        <p className="mt-2 max-w-[17rem] font-sans text-xs leading-relaxed text-yco-charcoal-muted">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="my-6 aspect-[4/3] overflow-hidden rounded-rounded bg-white">
                      {image ? (
                        <img
                          src={image}
                          alt={products[0]?.title || category.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading={index > 1 ? "lazy" : undefined}
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-sans text-6xl font-black lowercase text-yco-charcoal/20">
                          {category.name.slice(0, 1)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="font-sans text-yco-charcoal text-sm font-bold">
                          {category.name}
                        </div>
                        <p className="mt-1 font-sans text-xs text-yco-charcoal-muted">
                          {productCount} produkte
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
