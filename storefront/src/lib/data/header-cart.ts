"use server"

import { enrichLineItems, retrieveCart } from "./cart"

// Called after hydration, never while rendering the public page's HTML.
export async function retrieveHeaderCart() {
  const cart = await retrieveCart()
  if (cart?.items?.length && cart.region_id) {
    return { ...cart, items: await enrichLineItems(cart.items, cart.region_id) }
  }
  return cart
}
