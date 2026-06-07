"use client"

import Link from "next/link"
import { useRef } from "react"
import type { HttpTypes } from "@medusajs/types"
import type { MouseEvent, PointerEvent } from "react"
import type { CategoryProduct } from "./category-product-slider"

type CategoryCard = {
  category: HttpTypes.StoreProductCategory
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

// Some categories read better in a specific colour (e.g. period care → pink).
// Pinned categories win; everything else rotates through the palette.
const accentForCategory = (name: string, index: number) => {
  const normalized = name.toLowerCase()
  if (normalized.includes("period") || normalized.includes("menstr")) {
    return "yco-accent--coral"
  }
  return ACCENT_CLASSES[index % ACCENT_CLASSES.length]
}

export default function CategoryGrid({
  categories,
  countryCode,
}: {
  categories: CategoryCard[]
  countryCode: string
}) {
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

  const handleCategoryClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (dragState.current.suppressClick) {
      event.preventDefault()
    }
  }

  return (
    <section className="bg-white px-6 py-10 small:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="rhode-eyebrow inline-flex items-center gap-2">
              <span className="yco-accent-dot" aria-hidden />
              Shop by category
            </span>
            <h2 className="rhode-display mt-3 text-4xl md:text-5xl">
              categories
            </h2>
            <div className="yco-tricolor-rule mt-4" />
          </div>
          <Link
            href={`/${countryCode}/store`}
            className="hidden font-sans text-xs font-bold uppercase tracking-[0.18em] text-yco-charcoal transition-colors hover:text-pastel-coral-ink small:block"
          >
            View all
          </Link>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-6 cursor-grab overflow-x-auto px-6 pb-3 no-scrollbar active:cursor-grabbing small:mx-0 small:px-0"
          role="region"
          aria-label="Product categories"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          <div className="flex snap-x snap-mandatory gap-4">
            {categories.map(({ category, products }, index) => {
              const image = products[0]?.image
              const accentClass = accentForCategory(category.name, index)

              return (
                <Link
                  key={category.id}
                  href={`/${countryCode}/categories/${category.handle}`}
                  className={`group ${accentClass} yco-accent-card relative flex min-h-[360px] w-[78vw] max-w-[25rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-large p-5 small:w-[38vw] medium:w-[30vw] large:w-[24rem]`}
                  aria-label={`Shop ${category.name}`}
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
                        {products.length} products
                      </p>
                    </div>
                    <span className="rhode-round-btn rhode-round-btn--accent shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
