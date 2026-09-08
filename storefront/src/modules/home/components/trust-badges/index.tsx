import {
  FlaskConicalOff,
  Leaf,
  Rabbit,
  Recycle,
  type LucideIcon,
} from "lucide-react"

import { Stagger, StaggerItem } from "@modules/common/components/motion"

// Full literal class names so Tailwind keeps these hand-written @layer rules.
const ACCENT_CLASSES = [
  "yco-accent--mint",
  "yco-accent--coral",
  "yco-accent--blue",
] as const

/* Icons come from lucide-react rather than hand-drawn paths: the previous set
   was both generic (a heart for cruelty-free, a shopping bag for no-plastic)
   and mis-scaled — three of the four were drawn on a 24-unit grid inside a
   28-unit viewBox, so they sat off-centre in their circles. */
const badges: { icon: LucideIcon; label: string }[] = [
  // Leaf is the conventional organic mark.
  { icon: Leaf, label: "Organike të certifikuara" },
  // The leaping bunny is the actual cruelty-free certification symbol.
  { icon: Rabbit, label: "Cruelty-free" },
  // Reads as sustainable packaging; a crossed-out carton would say "no dairy".
  { icon: Recycle, label: "Pa plastikë" },
  // A struck-through lab flask: no harsh chemistry.
  { icon: FlaskConicalOff, label: "Jo toksike" },
]

export default function TrustBadges() {
  return (
    <section className="bg-white/40 px-6 py-2 small:py-3" aria-label="Standardet tona">
      <Stagger
        stagger={0.08}
        role="list"
        className="mx-auto grid max-w-6xl grid-cols-4 gap-x-2 gap-y-10 border-y border-yco-cream-dark py-4 md:gap-x-4"
      >
        {badges.map(({ icon: Icon, label }, index) => {
          const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length]

          return (
            <StaggerItem
              key={label}
              role="listitem"
              className={`${accentClass} group flex flex-col items-center gap-3 text-center md:gap-4`}
            >
              <div className="grid h-11 w-11 place-items-center rounded-circle bg-[color:var(--accent-soft)] text-[color:var(--accent-ink)] transition-transform duration-300 group-hover:-translate-y-1 md:h-14 md:w-14">
                <Icon
                  aria-hidden
                  strokeWidth={1.4}
                  className="h-5 w-5 md:h-[26px] md:w-[26px]"
                />
              </div>
              <div className="font-sans text-xs font-bold leading-tight tracking-wide text-yco-charcoal md:text-sm">
                {label}
              </div>
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}
