"use client"

import { ReactNode, useEffect, useRef } from "react"

type ProductScrollStageProps = {
  children: ReactNode
}

const ProductScrollStage = ({ children }: ProductScrollStageProps) => {
  const stageRef = useRef<HTMLDivElement>(null)

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
      className="content-container grid grid-cols-1 gap-6 py-4 small:h-[calc(100vh-6rem)] small:grid-cols-[minmax(0,1.18fr)_minmax(390px,0.82fr)] small:items-stretch small:gap-8 small:overflow-hidden small:py-3"
      data-testid="product-container"
    >
      {children}
    </div>
  )
}

export default ProductScrollStage
