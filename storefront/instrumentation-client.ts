import { schedulePostHogLoad } from "@lib/posthog"

// Next executes this module before rendering. Only install the lightweight
// scheduler here; the SDK is downloaded after load-time idle or interaction.
schedulePostHogLoad()
