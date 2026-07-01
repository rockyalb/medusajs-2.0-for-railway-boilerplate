"use client"

import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useMemo } from "react"
import type { HttpTypes } from "@medusajs/types"

import { getProductPrice } from "@lib/util/get-product-price"
import { Stagger, StaggerItem } from "@modules/common/components/motion"
import ShowcaseCard, { type ShowcaseProduct } from "../showcase-card"

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
  const [emblaRef] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      active: true,
      breakpoints: {
        "(min-width: 1024px)": { active: false },
      },
    },
    wheelGestures
  )

  if (!products.length) {
    return null
  }

  // Prices are already on the products (fetched with *variants.calculated_price),
  // so the cards receive plain serializable data — no per-card refetch.
  const showcaseProducts: ShowcaseProduct[] = products
    .slice(0, 6)
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
    <div className="content-container py-7 small:py-8">
      <div
        ref={emblaRef}
        className="-mx-6 overflow-hidden px-6 small:mx-0 small:px-0"
      >
        <Stagger
          stagger={0.07}
          role="list"
          className="flex gap-4 pb-4 small:grid small:grid-cols-6 small:gap-5 small:pb-0"
        >
          {showcaseProducts.map((product) => (
            <StaggerItem
              key={product.id}
              role="listitem"
              className="w-[68vw] max-w-[280px] shrink-0 xsmall:w-[42vw] small:w-auto small:max-w-none"
            >
              <ShowcaseCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  )
}
