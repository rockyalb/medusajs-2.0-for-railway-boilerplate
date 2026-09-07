/* Shared pieces for the mobile header controls (menu, search, bag).

   The three controls are drawn as soft white "pebbles" on the pink header:
   44px circles with a translucent fill and a hairline highlight, echoing the
   dots the YCO logo is built from. Icons share one weight (1.75 stroke,
   rounded caps) so the row reads as a set. No hooks here so both server and
   client components can import from this file. */

export const headerChipClass =
  "relative grid h-11 w-11 shrink-0 place-items-center rounded-circle border border-white/80 bg-white/60 text-yco-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-14px_rgba(47,45,41,0.55)] transition-[background-color,transform,color] duration-200 hover:bg-white/85 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2 focus-visible:ring-offset-yco-header-pink"

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

export function SearchIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path d="M15.4 15.4 20 20" />
    </svg>
  )
}

export function BagIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5.5 9.5h13l-.9 9.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5.5 9.5Z" />
      <path d="M8.75 9.5V7.75a3.25 3.25 0 0 1 6.5 0V9.5" />
    </svg>
  )
}

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
