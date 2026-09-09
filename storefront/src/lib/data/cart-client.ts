"use client"

import * as actions from "./cart"
import { retrieveHeaderCart } from "./header-cart"
import { createCartResource } from "@lib/util/cart-resource"

export const headerCart = createCartResource(retrieveHeaderCart)

export async function addToCart(...args: Parameters<typeof actions.addToCart>) {
  const result = await actions.addToCart(...args)
  void headerCart.refresh(true)
  return result
}

export async function updateLineItem(...args: Parameters<typeof actions.updateLineItem>) {
  const result = await actions.updateLineItem(...args)
  void headerCart.refresh()
  return result
}

export async function deleteLineItem(...args: Parameters<typeof actions.deleteLineItem>) {
  const result = await actions.deleteLineItem(...args)
  void headerCart.refresh()
  return result
}
