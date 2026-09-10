"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import useEmblaCarousel from "embla-carousel-react"
import Image, { getImageProps } from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productId: string
}

// Keep displayed and background images on the same responsive cache entries.
const gallerySizes = "(max-width: 1023px) 100vw, 58vw"

type IdleCapableWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number
  cancelIdleCallback?: (id: number) => void
}

const ImageGallery = ({ images, productId }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [settledFirstUrl, setSettledFirstUrl] = useState<string>()
  const prefetchedUrls = useRef(new Set<string>())
  const firstUrl = images[0]?.url
  const firstImageSettled = !!firstUrl && settledFirstUrl === firstUrl
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    skipSnaps: false,
  })
  const activeImage = images[activeIndex] ?? images[0]

  useEffect(() => {
    prefetchedUrls.current.clear()
    if (firstUrl) {
      prefetchedUrls.current.add(firstUrl)
    }
  }, [firstUrl])

  useEffect(() => {
    if (!firstImageSettled) {
      return
    }

    const visibleIndex = window.matchMedia("(max-width: 1023px)").matches
      ? mobileIndex
      : activeIndex
    const adjacentUrls = [
      images[visibleIndex - 1]?.url,
      images[visibleIndex + 1]?.url,
    ].filter((url): url is string => !!url)

    if (!adjacentUrls.length) {
      return
    }

    let cancelled = false
    let idleId: number | undefined
    let timeoutId: number | undefined

    const prefetchAdjacent = () => {
      if (cancelled) {
        return
      }

      adjacentUrls.forEach((url) => {
        if (prefetchedUrls.current.has(url)) {
          return
        }

        prefetchedUrls.current.add(url)
        const { props } = getImageProps({
          src: url,
          alt: "",
          fill: true,
          sizes: gallerySizes,
        })
        const pending = new window.Image()
        pending.setAttribute("fetchpriority", "low")
        pending.decoding = "async"
        pending.sizes = props.sizes ?? gallerySizes
        pending.srcset = props.srcSet ?? ""
        pending.src = props.src
      })
    }

    const idleWindow = window as IdleCapableWindow
    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(prefetchAdjacent, {
        timeout: 1200,
      })
    } else {
      timeoutId = window.setTimeout(prefetchAdjacent, 250)
    }

    return () => {
      cancelled = true
      if (idleId !== undefined && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [activeIndex, firstImageSettled, images, mobileIndex])

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
    <div className="relative h-full min-h-0">
      <div
        id={`product-image-discount-${productId}`}
        className="pointer-events-none absolute inset-0 z-[3]"
      />
      <div
        ref={emblaRef}
        className="overflow-hidden small:hidden"
        role="region"
        aria-label="Product images"
      >
        <div className="flex">
          {images.map((image, index) => {
            const isMobileActive = index === mobileIndex
            const isMobileAdjacent = Math.abs(index - mobileIndex) === 1
            const shouldRenderMobileImage =
              index === 0 ||
              isMobileActive ||
              (firstImageSettled && isMobileAdjacent)

            return (
              <Container
                key={image.id}
                className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-none bg-yco-panel-dark shadow-none"
                id={image.id}
              >
                {!!image.url && shouldRenderMobileImage && (
                  <Image
                    src={image.url}
                    loading={
                      index === 0 || isMobileActive ? "eager" : "lazy"
                    }
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

      <Container className="relative hidden h-full min-h-0 w-full overflow-hidden rounded-rounded bg-yco-panel-dark shadow-none small:block">
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
              objectFit: "contain",
            }}
          />
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 z-[2] flex max-h-[calc(100%_-_2rem)] flex-col gap-3 overflow-y-auto p-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-rounded border bg-white/60 transition-all duration-300 hover:scale-105"
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
        <div className="absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 justify-center small:hidden">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="flex h-11 w-6 items-center justify-center rounded-circle focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              aria-label={`Show product image ${index + 1}`}
              aria-current={mobileIndex === index}
              onClick={() => scrollMobileImage(index)}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 rounded-circle ring-1 ring-white transition-all ${
                  mobileIndex === index
                    ? "w-4 bg-yco-charcoal"
                    : "w-1.5 bg-yco-charcoal"
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
