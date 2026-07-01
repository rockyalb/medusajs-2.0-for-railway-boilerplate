"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useRef, useState } from "react"
import type { TouchEvent } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({
    index: 0,
    x: 0,
    y: 0,
  })
  const activeImage = images[activeIndex] ?? images[0]

  if (!images.length) {
    return null
  }

  const scrollMobileImage = (index: number, behavior: ScrollBehavior) => {
    const element = mobileScrollRef.current
    const nextIndex = Math.max(0, Math.min(index, images.length - 1))
    const target = element?.children[nextIndex] as HTMLElement | undefined
    const firstItem = element?.children[0] as HTMLElement | undefined

    setMobileIndex(nextIndex)

    if (element && target) {
      element.scrollTo({
        left: target.offsetLeft - (firstItem?.offsetLeft ?? 0),
        behavior,
      })
    }
  }

  const handleMobileTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]

    touchStartRef.current = {
      index: mobileIndex,
      x: touch.clientX,
      y: touch.clientY,
    }
  }

  const handleMobileTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0]
    const deltaX = touchStartRef.current.x - touch.clientX
    const deltaY = touchStartRef.current.y - touch.clientY

    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      scrollMobileImage(touchStartRef.current.index, "smooth")
      return
    }

    scrollMobileImage(
      touchStartRef.current.index + (deltaX > 0 ? 1 : -1),
      "smooth"
    )
  }

  return (
    <div className="relative h-full">
      <div
        ref={mobileScrollRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain small:hidden"
        onTouchStart={handleMobileTouchStart}
        onTouchEnd={handleMobileTouchEnd}
      >
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className="relative aspect-[4/5] w-[86vw] shrink-0 snap-center snap-always overflow-hidden rounded-rounded bg-yco-panel-dark shadow-none small:h-full small:w-full"
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="absolute inset-0 rounded-rounded"
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 1023px) 86vw, 58vw"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </Container>
          )
        })}
      </div>

      <Container className="relative hidden h-full w-full overflow-hidden rounded-rounded bg-yco-panel-dark shadow-none small:block">
        {!!activeImage?.url && (
          <Image
            src={activeImage.url}
            priority
            className="absolute inset-0 rounded-rounded"
            alt={`Product image ${activeIndex + 1}`}
            fill
            sizes="58vw"
            style={{
              objectFit: "cover",
            }}
          />
        )}

        {images.length > 1 && (
          <div className="absolute bottom-6 left-6 z-[2] flex flex-col gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className="relative h-14 w-14 overflow-hidden rounded-rounded border bg-white/60 transition-all duration-300 hover:scale-105"
                style={{
                  borderColor:
                    activeIndex === index
                      ? "rgba(103,100,94,0.95)"
                      : "rgba(255,255,255,0.72)",
                }}
                aria-label={`Show product image ${index + 1}`}
                aria-pressed={activeIndex === index}
              >
                {!!image.url && (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </Container>

      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 small:hidden">
          {images.map((image, index) => (
            <span
              key={image.id}
              className="h-1.5 w-1.5 rounded-circle bg-yco-charcoal/35"
              aria-label={`Product image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
