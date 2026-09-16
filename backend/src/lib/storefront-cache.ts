const getStorefrontUrl = () => {
  const configured = process.env.STOREFRONT_URL?.trim()

  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("STOREFRONT_URL is required to refresh the storefront cache")
  }

  return (configured || "http://localhost:8000").trim().replace(/\/+$/, "")
}

/**
 * Asks the storefront to hard-expire the homepage cache. Returns true when
 * the storefront confirmed the revalidation, false otherwise — a failure
 * here should never block saving the settings themselves.
 */
export const expireStorefrontHomepageCache = async (): Promise<boolean> => {
  try {
    const url = `${getStorefrontUrl()}/api/revalidate`
    const response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "Content-Type": "application/json",
        ...(process.env.REVALIDATE_SECRET
          ? { "x-revalidate-secret": process.env.REVALIDATE_SECRET }
          : {}),
      },
      body: JSON.stringify({ tags: ["homepage"] }),
    })

    if (!response.ok) {
      console.error(
        `Storefront revalidation failed: ${response.status} ${response.statusText}`
      )
    }

    if (!response.ok) return false

    const result = await response.json()
    return result.revalidated === true
  } catch (error) {
    console.error("Storefront revalidation request failed", error)
    return false
  }
}
