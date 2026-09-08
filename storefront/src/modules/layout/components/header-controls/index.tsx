/* Shared mobile header controls. Glyphs are lucide-react, the same family as
   the trust badges, so the site draws its icons from one set. */

import { Menu, Search, ShoppingBag, X } from "lucide-react"

/* The white pill behind each glyph is gone — the icons now sit directly on the
   pink bar. `rounded-circle` is kept with no border or background of its own so
   the focus ring stays round, and h-11/w-11 preserves the 44px tap target.
   Hover moves the ink instead of the backdrop. */
export const headerChipClass =
  "relative grid h-11 w-11 shrink-0 place-items-center rounded-circle text-yco-charcoal transition-colors duration-200 hover:text-yco-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 focus-visible:ring-offset-yco-header-pink"

/** The bag control: an icon on mobile, a plain tracked-caps link from `small`
    up. Exported so the Suspense fallback and the live cart button stay
    identical — they used to carry two hand-copied class strings that had
    drifted apart.

    The `small:` overrides that stripped the old white pill (border-0,
    bg-transparent, shadow-none, hover:bg-transparent) are gone: there is no
    pill left to strip. `small:hover:text-yco-coral` went with them, since the
    base class now applies that hover at every width. */
export const cartButtonClass = `${headerChipClass} small:h-full small:w-auto small:rounded-none small:px-2 small:active:scale-100`

export const cartLabelClass =
  "hidden font-hanken text-xs font-bold uppercase tracking-[0.14em] transition-colors duration-300 small:inline-block"

/* Light stroke glyphs in place of the old Heroicons solid set — with the pill
   removed there is nothing to sit inside, so a filled shape read heavy against
   the pink. Names are unchanged so every consumer keeps compiling. */
const glyph = { size: 22, strokeWidth: 1.75, "aria-hidden": true } as const

export const MenuIcon = () => <Menu {...glyph} />
export const CloseIcon = () => <X {...glyph} />
export const SearchIcon = () => <Search {...glyph} />
export const BagIcon = () => <ShoppingBag {...glyph} />

/** Coral count pebble pinned to the chip's top-right edge. Hidden at zero so
    an empty bag stays quiet; the button's aria-label still carries the count. */
export function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span
      aria-hidden
      className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-circle border-2 border-yco-header-pink bg-pastel-coral px-1 font-hanken text-[10px] font-black leading-none text-yco-charcoal"
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}
