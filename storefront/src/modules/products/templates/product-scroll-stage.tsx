"use client"

import { ReactNode, useEffect, useRef } from "react"

type ProductScrollStageProps = {
  children: ReactNode
}

const ProductScrollStage = ({ children }: ProductScrollStageProps) => {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const header = document.getElementById("site-header")

    if (!stage || !header) {
      return
    }

    const syncHeaderHeight = () => {
      stage.style.setProperty(
        "--site-header-height",
        `${header.offsetHeight}px`
      )
    }

    syncHeaderHeight()

    const observer = new ResizeObserver(syncHeaderHeight)
    observer.observe(header)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        return
      }

      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return
      }

      const stage = stageRef.current
      const panel = document.getElementById("product-details-panel")

      if (!stage || !panel) {
        return
      }

      const stageRect = stage.getBoundingClientRect()
      const stageInView =
        stageRect.top < window.innerHeight && stageRect.bottom > 0

      if (!stageInView) {
        return
      }

      const maxScroll = panel.scrollHeight - panel.clientHeight
      const isScrollable = maxScroll > 1
      const scrollingDown = event.deltaY > 0
      const canScrollDown = panel.scrollTop < maxScroll - 1
      const canScrollUp = panel.scrollTop > 1

      if (
        isScrollable &&
        ((scrollingDown && canScrollDown) || (!scrollingDown && canScrollUp))
      ) {
        event.preventDefault()
        panel.scrollBy({
          top: event.deltaY,
          behavior: "auto",
        })
      }
    }

    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    })

    return () => {
      window.removeEventListener("wheel", handleWheel, {
        capture: true,
      })
    }
  }, [])

  return (
    <div
      ref={stageRef}
      className="mx-auto grid w-full grid-cols-1 gap-0 py-0 small:h-[calc(100dvh_-_var(--site-header-height,7.5rem))] small:min-h-0 small:max-w-[1440px] small:grid-cols-[minmax(0,1.18fr)_minmax(390px,0.82fr)] small:grid-rows-[minmax(0,1fr)] small:items-stretch small:gap-8 small:overflow-hidden small:px-6 small:py-3"
      data-testid="product-container"
    >
      {children}
    </div>
  )
}

export default ProductScrollStage
