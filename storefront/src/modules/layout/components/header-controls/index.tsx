/* Shared mobile header controls. Glyphs use the Heroicons solid set. */

export const headerChipClass =
  "relative grid h-11 w-11 shrink-0 place-items-center rounded-circle border border-white/80 bg-white/60 text-yco-charcoal transition-colors duration-200 hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 focus-visible:ring-offset-yco-header-pink"

export { SearchIcon, BagIcon, MenuIcon, CloseIcon } from "./heroicons"

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
