const getStorefrontUrl = () => {
  const configured = process.env.STOREFRONT_URL || ""

  return (configured || "http://localhost:8000").trim().replace(/\/+$/, "")
}

/**
 * Asks the storefront to hard-expire the homepage cache. Returns true when
 * the storefront confirmed the revalidation, false otherwise — a failure
 * here should never block saving the settings themselves.
 */
export const expireStorefrontHomepageCache = async (): Promise<boolean> => {
  const url = `${getStorefrontUrl()}/api/revalidate`

  try {
    const response = await fetch(url, {
      method: "POST",
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

    return response.ok
  } catch (error) {
    console.error("Storefront revalidation request failed", error)
    return false
  }
}
