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
