"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import useEmblaCarousel from "embla-carousel-react"
import Image, { getImageProps } from "next/image"
import { useCallback, useEffect, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

// Keep displayed and background images on the same responsive cache entries.
const gallerySizes = "(max-width: 1023px) 100vw, 58vw"

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [settledFirstUrl, setSettledFirstUrl] = useState<string>()
  const firstUrl = images[0]?.url
  const firstImageSettled = !!firstUrl && settledFirstUrl === firstUrl
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    skipSnaps: false,
  })
  const activeImage = images[activeIndex] ?? images[0]

  useEffect(() => {
    if (!firstImageSettled) return

    let cancelled = false
    let pending: HTMLImageElement | undefined
    const remaining = images.slice(1).filter((image) => image.url)
    let index = 0
    const loadNext = () => {
      if (cancelled || index >= remaining.length) return
      const image = remaining[index++]
      const { props } = getImageProps({
        src: image.url,
        alt: "",
        fill: true,
        sizes: gallerySizes,
      })
      pending = new window.Image()
      pending.setAttribute("fetchpriority", "low")
      pending.decoding = "async"
      pending.onload = loadNext
      pending.onerror = loadNext
      pending.sizes = props.sizes ?? gallerySizes
      pending.srcset = props.srcSet ?? ""
      pending.src = props.src
    }
    loadNext()
    return () => {
      cancelled = true
      if (pending) {
        pending.onload = null
        pending.onerror = null
      }
    }
  }, [images, firstImageSettled])

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
        <div className="flex">
          {images.map((image, index) => {
            return (
              <Container
                key={image.id}
                className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-none bg-yco-panel-dark shadow-none"
                id={image.id}
              >
                {!!image.url && (index === 0 || firstImageSettled || index === mobileIndex) && (
                  <Image
                    src={image.url}
                    loading={index === 0 || index === mobileIndex ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    onLoad={index === 0 ? () => setSettledFirstUrl(firstUrl) : undefined}
                    onError={index === 0 ? () => setSettledFirstUrl(firstUrl) : undefined}
                    className="absolute inset-0"
                    alt={`Product image ${index + 1}`}
                    fill
                    sizes={gallerySizes}
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
            loading="eager"
            fetchPriority={activeIndex === 0 ? "high" : "auto"}
            onLoad={activeIndex === 0 ? () => setSettledFirstUrl(firstUrl) : undefined}
            onError={activeIndex === 0 ? () => setSettledFirstUrl(firstUrl) : undefined}
            className="absolute inset-0 rounded-rounded"
            alt={`Product image ${activeIndex + 1}`}
            fill
            sizes={gallerySizes}
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
        <div className="absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 justify-center rounded-circle border border-yco-charcoal/20 bg-white px-1 shadow-sm small:hidden">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-circle focus-visible:outline focus-visible:outline-2 focus-visible:outline-yco-charcoal"
              aria-label={`Show product image ${index + 1}`}
              aria-current={mobileIndex === index}
              onClick={() => scrollMobileImage(index)}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 rounded-circle transition-all ${
                  mobileIndex === index
                    ? "w-5 bg-yco-charcoal"
                    : "w-1.5 bg-yco-charcoal/70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
