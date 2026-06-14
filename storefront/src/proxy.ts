import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "al"
const COUNTRY_CODE_COOKIE_NAME = "_medusa_country_code"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      // Fetch regions from Medusa. We can't use the JS client here because proxy is running on Edge and the client needs a Node environment.
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const regions = data?.regions

        if (regions?.length) {
          // Clear any fallback entries if we retrieved actual regions
          regionMapCache.regionMap.clear()

          // Create a map of country codes to regions.
          regions.forEach((region: HttpTypes.StoreRegion) => {
            region.countries?.forEach((c) => {
              regionMapCache.regionMap.set(c.iso_2 ?? "", region)
            })
          })

          regionMapCache.regionMapUpdated = Date.now()
          return regionMapCache.regionMap
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Proxy.ts: Error fetching regions from backend. Is the Medusa backend server running?",
          error
        )
      }
    }
  }

  return regionMapCache.regionMap
}

/**
 * Resolves the active country from the cookie, request, or configured fallback.
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    const cookieCountryCode = request.cookies
      .get(COUNTRY_CODE_COOKIE_NAME)
      ?.value?.toLowerCase()

    if (cookieCountryCode && regionMap.has(cookieCountryCode)) {
      return cookieCountryCode
    }

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      return urlCountryCode
    }

    if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      return vercelCountryCode
    }

    if (regionMap.has(DEFAULT_REGION)) {
      return DEFAULT_REGION
    }

    return regionMap.keys().next().value ?? null
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Proxy.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?"
      )
    }
  }
}

/**
 * Proxy to handle region selection and onboarding status.
 */
export async function proxy(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const isOnboarding = searchParams.get("onboarding") === "true"
  const cartId = searchParams.get("cart_id")
  const checkoutStep = searchParams.get("step")
  const onboardingCookie = request.cookies.get("_medusa_onboarding")

  const regionMap = await getRegionMap()

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  if (!countryCode) {
    return NextResponse.next()
  }

  const pathSegments = request.nextUrl.pathname.split("/").filter(Boolean)
  const urlCountryCode = pathSegments[0]?.toLowerCase()
  const urlHasCountryCode = Boolean(
    urlCountryCode && regionMap.has(urlCountryCode)
  )

  let response: NextResponse

  if (urlHasCountryCode) {
    const cleanUrl = request.nextUrl.clone()
    cleanUrl.pathname = `/${pathSegments.slice(1).join("/")}`
    response = NextResponse.redirect(cleanUrl, 308)
  } else if (cartId && !checkoutStep) {
    const checkoutUrl = request.nextUrl.clone()
    checkoutUrl.searchParams.set("step", "address")
    response = NextResponse.redirect(checkoutUrl, 307)
  } else {
    const internalUrl = request.nextUrl.clone()
    internalUrl.pathname =
      request.nextUrl.pathname === "/"
        ? `/${countryCode}`
        : `/${countryCode}${request.nextUrl.pathname}`
    response = NextResponse.rewrite(internalUrl)
  }

  response.cookies.set(COUNTRY_CODE_COOKIE_NAME, countryCode, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })

  if (cartId && !checkoutStep) {
    response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
  }

  // Set a cookie to indicate that we're onboarding. This is used to show the onboarding flow.
  if (isOnboarding && !onboardingCookie) {
    response.cookies.set("_medusa_onboarding", "true", { maxAge: 60 * 60 * 24 })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
}
