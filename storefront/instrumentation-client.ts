import posthog from "posthog-js"

import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from "@lib/posthog"

// Next.js runs this once in the browser before the app renders, which is the
// single place the posthog-js singleton is initialized. Capture helpers in
// @lib/posthog stay inert when either value is missing, so a misconfigured
// environment drops events instead of failing the page — the development
// throws below exist to make that state obvious while working locally.
if (!POSTHOG_PROJECT_TOKEN) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
    )
  }
} else if (!POSTHOG_HOST) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured"
    )
  }
} else {
  posthog.init(POSTHOG_PROJECT_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  })
}
