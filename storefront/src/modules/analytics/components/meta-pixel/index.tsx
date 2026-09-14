"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

import {
  ensureFacebookCookies,
  ensureMetaPixelQueue,
  META_PIXEL_ID,
  scheduleMetaPixelLoad,
  trackMetaEvent,
} from "@lib/meta-pixel"

function MetaPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    if (!META_PIXEL_ID) {
      return
    }

    ensureFacebookCookies()
    trackMetaEvent("PageView")
  }, [pathname, search])

  return null
}

export default function MetaPixel() {
  useEffect(() => {
    if (!META_PIXEL_ID) {
      return
    }

    ensureFacebookCookies()
    ensureMetaPixelQueue()

    return scheduleMetaPixelLoad()
  }, [])

  if (!META_PIXEL_ID) {
    return null
  }

  return (
    <>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <MetaPageView />
      </Suspense>
    </>
  )
}
