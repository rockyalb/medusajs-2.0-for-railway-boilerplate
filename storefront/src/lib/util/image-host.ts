/**
 * Decides whether an image URL can go through the Next image optimizer.
 *
 * `next/image` throws at render time when a remote host is not listed in
 * `images.remotePatterns`. Admin-editable URLs (hero, category cards) can
 * point anywhere, so we only optimize hosts we know are allowed and fall
 * back to `unoptimized` for the rest instead of crashing the page.
 */
const KNOWN_IMAGE_HOSTS = [
  "bucket-production-a1707.up.railway.app",
  "bucket-production-9ef2.up.railway.app",
  process.env.NEXT_PUBLIC_BASE_URL,
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
]
  .filter((value): value is string => !!value)
  .map((value) => {
    try {
      return new URL(value.includes("://") ? value : `https://${value}`).hostname
    } catch {
      return value
    }
  })

export function isOptimizableImageUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false
  }

  if (url.startsWith("/")) {
    return true
  }

  try {
    const { hostname } = new URL(url)
    return KNOWN_IMAGE_HOSTS.includes(hostname)
  } catch {
    return false
  }
}
