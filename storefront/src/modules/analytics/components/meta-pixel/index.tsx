"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

import { META_PIXEL_ID, trackMetaEvent } from "@lib/meta-pixel"

const FB_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90

function getCookie(name: string) {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`)
  )

  return match ? decodeURIComponent(match[1]) : undefined
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${FB_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

function ensureFacebookCookies() {
  const now = Date.now()
  const params = new URLSearchParams(window.location.search)
  const fbclid = params.get("fbclid")

  if (!getCookie("_fbp")) {
    setCookie("_fbp", `fb.1.${now}.${Math.floor(Math.random() * 10 ** 10)}`)
  }

  if (fbclid) {
    setCookie("fbclid", fbclid)
    setCookie("_fbc", `fb.1.${now}.${fbclid}`)
  }
}

function MetaPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!META_PIXEL_ID) {
      return
    }

    ensureFacebookCookies()
    trackMetaEvent("PageView")
  }, [pathname, searchParams])

  return null
}

export default function MetaPixel() {
  if (!META_PIXEL_ID) {
    return null
  }

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
        `}
      </Script>
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
