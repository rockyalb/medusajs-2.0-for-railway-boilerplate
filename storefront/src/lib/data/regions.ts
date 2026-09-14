import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { HttpTypes } from "@medusajs/types"

const publicCacheOptions = { cache: "force-cache" as const, next: { tags: ["regions"], revalidate: 3600 } }

export const listRegions = cache(async function () {
  return sdk.store.region
    .list({}, publicCacheOptions)
    .then(({ regions }) => regions)
    .catch(medusaError)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.store.region
    .retrieve(id, {}, publicCacheOptions)
    .then(({ region }) => region)
    .catch(medusaError)
})

export const getRegion = cache(async function (countryCode: string) {
  try {
    const regions = await listRegions()

    if (!regions) {
      return null
    }

    // Derive this from the revalidated data instead of retaining a process-lifetime map.
    const selected = (countryCode || "al").toLowerCase()
    return regions.find((region) => region.countries?.some((country) => country.iso_2 === selected))
  } catch (e: any) {
    return null
  }
})
