"use client"

import { usePathname } from "next/navigation"
import { useEffect, useSyncExternalStore } from "react"
import CartDropdown from "../cart-dropdown"
import { headerCart } from "@lib/data/cart-client"

export default function CartButton() {
  const pathname = usePathname()
  const state = useSyncExternalStore(headerCart.subscribe, headerCart.getSnapshot, headerCart.getServerSnapshot)
  useEffect(() => {
    void headerCart.refresh()
    const refresh = () => { void headerCart.refresh() }
    window.addEventListener("focus", refresh)
    return () => window.removeEventListener("focus", refresh)
  }, [pathname])

  return <CartDropdown cart={state.cart} loaded={state.loaded} error={state.error}
    openVersion={state.openVersion} onRefresh={() => { void headerCart.refresh() }} />
}
