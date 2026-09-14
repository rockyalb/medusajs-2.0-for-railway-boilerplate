"use client"

import posthog from "posthog-js"

export const POSTHOG_PROJECT_TOKEN =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

// Both values are required to reach a project, so the browser SDK is only
// initialized when each is present. Every helper below repeats that check so
// callers never have to guard an unconfigured environment themselves.
export const POSTHOG_ENABLED = Boolean(POSTHOG_PROJECT_TOKEN && POSTHOG_HOST)

function ready() {
  return typeof window !== "undefined" && POSTHOG_ENABLED
}

export function trackPostHogEvent(
  eventName: string,
  payload?: Record<string, unknown>
) {
  if (!ready()) {
    return
  }

  posthog.capture(eventName, payload)
}

const ONCE_STORAGE_PREFIX = "yco_posthog_once:"

/**
 * Capture an event at most once per key on this browser. Used for conversions
 * that render on a page the shopper can reload or revisit — the confirmation
 * page — where a plain capture would count the same order more than once.
 */
export function trackPostHogEventOnce(
  dedupeKey: string,
  eventName: string,
  payload?: Record<string, unknown>
) {
  if (!ready()) {
    return
  }

  const storageKey = `${ONCE_STORAGE_PREFIX}${dedupeKey}`

  try {
    if (window.localStorage.getItem(storageKey)) {
      return
    }
    window.localStorage.setItem(storageKey, "1")
  } catch {
    // Storage can be unavailable (private mode, blocked site data). Capturing a
    // possible duplicate is better than dropping the conversion entirely.
  }

  posthog.capture(eventName, payload)
}

export function identifyPostHogCustomer(
  customerId: string,
  properties?: Record<string, unknown>
) {
  if (!ready()) {
    return
  }

  posthog.identify(customerId, properties)
}

export function resetPostHog() {
  if (!ready()) {
    return
  }

  posthog.reset()
}
