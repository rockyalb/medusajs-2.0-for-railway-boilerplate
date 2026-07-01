"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    skipSnaps: false,
  })
  const activeImage = images[activeIndex] ?? images[0]

  const updateMobileIndex = useCallback(() => {
    if (!emblaApi) {
      return
    }

    setMobileIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    updateMobileIndex()

    emblaApi.on("select", updateMobileIndex)
    emblaApi.on("reInit", updateMobileIndex)

    return () => {
      emblaApi.off("select", updateMobileIndex)
      emblaApi.off("reInit", updateMobileIndex)
    }
  }, [emblaApi, updateMobileIndex])

  if (!images.length) {
    return null
  }

  const scrollMobileImage = (index: number) => {
    if (!emblaApi) {
      return
    }

    emblaApi.scrollTo(index)
  }

  return (
    <div className="relative h-full">
      <div
        ref={emblaRef}
        className="overflow-hidden small:hidden"
        role="region"
        aria-label="Product images"
      >
        <div className="flex gap-3">
          {images.map((image, index) => {
            return (
              <Container
                key={image.id}
                className="relative aspect-[4/5] w-[86vw] shrink-0 overflow-hidden rounded-rounded bg-yco-panel-dark shadow-none small:h-full small:w-full"
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
            <button
              key={image.id}
              type="button"
              className={`h-1.5 rounded-circle transition-all ${
                mobileIndex === index
                  ? "w-5 bg-yco-charcoal"
                  : "w-1.5 bg-yco-charcoal/35"
              }`}
              aria-label={`Show product image ${index + 1}`}
              aria-current={mobileIndex === index}
              onClick={() => scrollMobileImage(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
