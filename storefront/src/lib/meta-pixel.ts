"use client"

export type MetaPixelContent = {
  id?: string | null
  item_price?: number | null
  quantity?: number | null
}

type MetaPixelEventOptions = {
  eventID?: string
}

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  loaded?: boolean
  queue?: unknown[][]
  push?: MetaPixelFunction
  version?: string
}

const FB_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90
const META_PIXEL_SCRIPT_ID = "meta-pixel-script"
const META_PIXEL_SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js"
const META_PIXEL_IDLE_TIMEOUT_MS = 2000
const META_PIXEL_FALLBACK_TIMEOUT_MS = 2500
const MAX_DEDUPLICATED_EVENT_IDS = 100

declare global {
  interface Window {
    fbq?: MetaPixelFunction
    _fbq?: MetaPixelFunction
    __ycoMetaPixelInitialized?: boolean
    __ycoMetaPixelLastLocation?: string
    __ycoMetaPixelLastEventKeys?: Record<string, string>
    __ycoMetaPixelEventIds?: Set<string>
    __ycoMetaPixelScriptLoaded?: boolean
    __ycoMetaPixelScriptPromise?: Promise<void>
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

function getCookie(name: string) {
  if (typeof document === "undefined") {
    return undefined
  }

  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`
    )
  )

  if (!match) {
    return undefined
  }

  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${FB_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

export function ensureFacebookCookies() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return
  }

  const now = Date.now()
  const fbclid = new URLSearchParams(window.location.search).get("fbclid")

  if (!getCookie("_fbp")) {
    setCookie("_fbp", `fb.1.${now}.${Math.floor(Math.random() * 10 ** 10)}`)
  }

  if (fbclid) {
    const existingFbclid = getCookie("fbclid")
    const existingFbc = getCookie("_fbc")

    // Route effects can run more than once while navigating. Keep the
    // original attribution timestamp for the same click instead of rewriting
    // the cookies on every render.
    if (existingFbclid !== fbclid || !existingFbc) {
      setCookie("fbclid", fbclid)
      setCookie("_fbc", `fb.1.${now}.${fbclid}`)
    }
  }
}

function createMetaPixelStub(): MetaPixelFunction {
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args)
    } else {
      fbq.queue?.push(args)
    }
  }) as MetaPixelFunction

  fbq.push = fbq
  fbq.loaded = true
  fbq.version = "2.0"
  fbq.queue = []

  return fbq
}

/**
 * Install the tiny Meta-compatible command queue without loading the heavy
 * library. Event-producing components can call this immediately after
 * hydration, while the external script is scheduled separately at idle.
 */
export function ensureMetaPixelQueue() {
  if (typeof window === "undefined" || !META_PIXEL_ID) {
    return undefined
  }

  const fbq = window.fbq ?? createMetaPixelStub()
  window.fbq = fbq
  window._fbq ??= fbq

  if (!window.__ycoMetaPixelInitialized) {
    const hasQueuedInit = fbq.queue?.some(
      (command) => command[0] === "init" && command[1] === META_PIXEL_ID
    )

    if (!hasQueuedInit) {
      fbq("init", META_PIXEL_ID)
    }

    window.__ycoMetaPixelInitialized = true
  }

  return fbq
}

function eventDedupeKey(
  eventName: string,
  payload?: Record<string, unknown>,
  options?: MetaPixelEventOptions
) {
  if (typeof window === "undefined") {
    return undefined
  }

  if (options?.eventID) {
    return `id:${eventName}:${options.eventID}`
  }

  if (eventName !== "PageView" && eventName !== "ViewContent") {
    return undefined
  }

  const contentIds = Array.isArray(payload?.content_ids)
    ? payload.content_ids.join(",")
    : ""

  return `${eventName}:${window.location.pathname}${window.location.search}:${contentIds}`
}

function isDuplicateEvent(
  eventName: string,
  payload?: Record<string, unknown>,
  options?: MetaPixelEventOptions
) {
  if (typeof window === "undefined") {
    return false
  }

  const location = window.location.pathname + window.location.search
  if (window.__ycoMetaPixelLastLocation !== location) {
    window.__ycoMetaPixelLastLocation = location
    window.__ycoMetaPixelLastEventKeys = {}
  }

  const key = eventDedupeKey(eventName, payload, options)
  if (!key) {
    return false
  }

  // Purchase event IDs need durable dedupe across a remount of the order
  // confirmation tree. PageView/ViewContent only suppress an immediately
  // repeated effect, allowing a later return to the same URL to be tracked.
  if (options?.eventID) {
    const eventIds = (window.__ycoMetaPixelEventIds ??= new Set<string>())
    if (eventIds.has(key)) {
      return true
    }

    eventIds.add(key)
    if (eventIds.size > MAX_DEDUPLICATED_EVENT_IDS) {
      const oldest = eventIds.values().next().value
      if (oldest) {
        eventIds.delete(oldest)
      }
    }

    return false
  }

  const lastEventKeys = (window.__ycoMetaPixelLastEventKeys ??= {})
  if (lastEventKeys[eventName] === key) {
    return true
  }

  lastEventKeys[eventName] = key
  return false
}

export function trackMetaEvent(
  eventName: string,
  payload?: Record<string, unknown>,
  options?: MetaPixelEventOptions
) {
  if (typeof window === "undefined" || !META_PIXEL_ID) {
    return
  }

  if (isDuplicateEvent(eventName, payload, options)) {
    return
  }

  const fbq = ensureMetaPixelQueue()
  fbq?.("track", eventName, payload ?? {}, options ?? {})
}

function findMetaPixelScript() {
  if (typeof document === "undefined") {
    return null
  }

  return (
    document.getElementById(META_PIXEL_SCRIPT_ID) ||
    document.querySelector<HTMLScriptElement>(
      `script[src="${META_PIXEL_SCRIPT_SRC}"]`
    )
  )
}

export function loadMetaPixelScript() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !META_PIXEL_ID
  ) {
    return Promise.resolve()
  }

  ensureMetaPixelQueue()

  if (window.__ycoMetaPixelScriptLoaded) {
    return Promise.resolve()
  }

  if (window.__ycoMetaPixelScriptPromise) {
    return window.__ycoMetaPixelScriptPromise
  }

  const existingScript = findMetaPixelScript()
  if (existingScript) {
    return Promise.resolve()
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.id = META_PIXEL_SCRIPT_ID
    script.async = true
    script.src = META_PIXEL_SCRIPT_SRC
    script.onload = () => {
      window.__ycoMetaPixelScriptLoaded = true
      resolve()
    }
    script.onerror = () => {
      window.__ycoMetaPixelScriptPromise = undefined
      script.remove()
      reject(new Error("Meta Pixel script failed to load"))
    }
    ;(document.head || document.body).appendChild(script)
  })

  window.__ycoMetaPixelScriptPromise = promise
  return promise
}

/**
 * Start loading after the browser has had an idle period, with a bounded
 * timer for browsers that never provide idle time. Cleanup only cancels a
 * pending schedule; an already-requested script is allowed to finish.
 */
export function scheduleMetaPixelLoad() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !META_PIXEL_ID
  ) {
    return () => {}
  }

  ensureMetaPixelQueue()

  if (window.__ycoMetaPixelScriptLoaded || findMetaPixelScript()) {
    return () => {}
  }

  let cancelled = false
  let started = false
  let idleHandle: number | undefined
  let fallbackHandle: number | undefined
  let loadListener: (() => void) | undefined

  const start = () => {
    if (cancelled || started) {
      return
    }

    started = true
    if (idleHandle !== undefined && window.cancelIdleCallback) {
      window.cancelIdleCallback(idleHandle)
    }
    if (fallbackHandle !== undefined) {
      window.clearTimeout(fallbackHandle)
    }
    if (loadListener) {
      window.removeEventListener("load", loadListener)
      loadListener = undefined
    }

    void loadMetaPixelScript().catch(() => {})
  }

  const onPageHide = () => start()
  const scheduleIdleLoad = () => {
    if (cancelled || started) {
      return
    }

    if (window.requestIdleCallback) {
      idleHandle = window.requestIdleCallback(start, {
        timeout: META_PIXEL_IDLE_TIMEOUT_MS,
      })
      fallbackHandle = window.setTimeout(start, META_PIXEL_FALLBACK_TIMEOUT_MS)
    } else {
      // Yield one task when requestIdleCallback is unavailable. This is the
      // bounded fallback for older browsers, where a native idle callback does
      // not exist.
      fallbackHandle = window.setTimeout(start, 1)
    }
  }

  window.addEventListener("pagehide", onPageHide, { once: true })
  if (document.readyState === "complete") {
    scheduleIdleLoad()
  } else {
    loadListener = () => {
      loadListener = undefined
      scheduleIdleLoad()
    }
    window.addEventListener("load", loadListener, { once: true })
  }

  return () => {
    cancelled = true
    if (idleHandle !== undefined && window.cancelIdleCallback) {
      window.cancelIdleCallback(idleHandle)
    }
    if (fallbackHandle !== undefined) {
      window.clearTimeout(fallbackHandle)
    }
    if (loadListener) {
      window.removeEventListener("load", loadListener)
    }
    window.removeEventListener("pagehide", onPageHide)
  }
}

export function buildMetaContents(
  contents: MetaPixelContent[]
): MetaPixelContent[] {
  return contents
    .filter((content) => content.id)
    .map((content) => ({
      id: content.id,
      quantity: content.quantity ?? 1,
      item_price: content.item_price ?? undefined,
    }))
}
