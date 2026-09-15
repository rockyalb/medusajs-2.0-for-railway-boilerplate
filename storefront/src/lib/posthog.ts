"use client"

type PostHogClient = typeof import("posthog-js/no-external")["default"]

export const POSTHOG_PROJECT_TOKEN =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

export const POSTHOG_ENABLED = Boolean(POSTHOG_PROJECT_TOKEN && POSTHOG_HOST)

const ONCE_STORAGE_PREFIX = "yco_posthog_once:"
const POSTHOG_IDLE_TIMEOUT_MS = 6000
const POSTHOG_FALLBACK_DELAY_MS = 6500

let postHogPromise: Promise<PostHogClient | null> | null = null

type IdleCapableWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number
  cancelIdleCallback?: (id: number) => void
}

function canLoadPostHog() {
  return typeof window !== "undefined" && POSTHOG_ENABLED
}

/**
 * Keep the analytics SDK out of Next's critical bootstrap. The no-external
 * entrypoint plus explicit opt-outs prevent commerce events from pulling in
 * session replay, surveys, dead-click tracking, web vitals, or exceptions.
 */
export function loadPostHog(): Promise<PostHogClient | null> {
  if (!canLoadPostHog()) {
    return Promise.resolve(null)
  }

  if (!postHogPromise) {
    postHogPromise = import("posthog-js/no-external")
      .then(({ default: posthog }) => {
        posthog.init(POSTHOG_PROJECT_TOKEN!, {
          api_host: POSTHOG_HOST!,
          defaults: "2026-01-30",
          autocapture: false,
          rageclick: false,
          capture_dead_clicks: false,
          capture_exceptions: false,
          capture_performance: false,
          disable_session_recording: true,
          disable_surveys: true,
          disable_external_dependency_loading: true,
          debug: process.env.NODE_ENV === "development",
        })

        return posthog
      })
      .catch(() => null)
  }

  return postHogPromise
}

/** Start PostHog after load-time idle, or immediately on real interaction. */
export function schedulePostHogLoad() {
  if (!canLoadPostHog()) {
    return () => {}
  }

  const idleWindow = window as IdleCapableWindow
  let cancelled = false
  let started = false
  let idleHandle: number | undefined
  let fallbackHandle: number | undefined
  let loadListener: (() => void) | undefined
  const interactionEvents = ["pointerdown", "keydown", "touchstart"] as const

  const removeInteractionListeners = () => {
    interactionEvents.forEach((eventName) =>
      window.removeEventListener(eventName, start)
    )
  }

  const clearScheduledLoad = () => {
    if (idleHandle !== undefined && idleWindow.cancelIdleCallback) {
      idleWindow.cancelIdleCallback(idleHandle)
    }
    if (fallbackHandle !== undefined) {
      window.clearTimeout(fallbackHandle)
    }
    if (loadListener) {
      window.removeEventListener("load", loadListener)
      loadListener = undefined
    }
    removeInteractionListeners()
  }

  function start() {
    if (cancelled || started) {
      return
    }

    started = true
    clearScheduledLoad()
    void loadPostHog()
  }

  const scheduleIdleLoad = () => {
    if (cancelled || started) {
      return
    }

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(start, {
        timeout: POSTHOG_IDLE_TIMEOUT_MS,
      })
    } else {
      fallbackHandle = window.setTimeout(start, POSTHOG_FALLBACK_DELAY_MS)
    }
  }

  interactionEvents.forEach((eventName) =>
    window.addEventListener(eventName, start, { once: true, passive: true })
  )

  if (document.readyState === "complete") {
    scheduleIdleLoad()
  } else {
    loadListener = scheduleIdleLoad
    window.addEventListener("load", loadListener, { once: true })
  }

  return () => {
    cancelled = true
    clearScheduledLoad()
  }
}

export async function trackPostHogEvent(
  eventName: string,
  payload?: Record<string, unknown>
) {
  const posthog = await loadPostHog()
  posthog?.capture(eventName, payload)
}

export async function trackPostHogEventOnce(
  dedupeKey: string,
  eventName: string,
  payload?: Record<string, unknown>
) {
  if (!canLoadPostHog()) {
    return
  }

  const storageKey = `${ONCE_STORAGE_PREFIX}${dedupeKey}`

  try {
    if (window.localStorage.getItem(storageKey)) {
      return
    }
    window.localStorage.setItem(storageKey, "1")
  } catch {
    // Storage can be unavailable. Capturing a possible duplicate is better
    // than dropping a confirmed conversion entirely.
  }

  const posthog = await loadPostHog()
  posthog?.capture(eventName, payload)
}

export async function identifyPostHogCustomer(
  customerId: string,
  properties?: Record<string, unknown>
) {
  const posthog = await loadPostHog()
  posthog?.identify(customerId, properties)
}

export async function resetPostHog() {
  const posthog = await loadPostHog()
  posthog?.reset()
}
