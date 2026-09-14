"use client"

export type MetaPixelContent = {
  id?: string | null
  item_price?: number | null
  quantity?: number | null
}

type MetaPixelEventOptions = {
  eventID?: string
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function trackMetaEvent(
  eventName: string,
  payload?: Record<string, unknown>,
  options?: MetaPixelEventOptions
) {
  if (typeof window === "undefined" || !window.fbq || !META_PIXEL_ID) {
    return
  }

  window.fbq("track", eventName, payload ?? {}, options ?? {})
}

export function buildMetaContents(
  contents: MetaPixelContent[]
): MetaPixelContent[] {
  return contents
    .filter((content) => content.id)
    .map((content) => ({
      id: content.id,
      quantity: content.quantity ?? 1,
      item_price: content.item_price ?? undefined,
    }))
}
