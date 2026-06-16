import { Stagger, StaggerItem } from "@modules/common/components/motion"

// Full literal class names so Tailwind keeps these hand-written @layer rules.
const ACCENT_CLASSES = [
  "yco-accent--mint",
  "yco-accent--coral",
  "yco-accent--blue",
] as const

const badges = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 3C14 3 6 7 6 14a8 8 0 0 0 16 0c0-7-8-11-8-11Z" />
        <path d="M14 3v18" />
        <path d="M10 10c1.5 1.5 2.5 3 4 4" />
        <path d="M18 10c-1.5 1.5-2.5 3-4 4" />
      </svg>
    ),
    label: "Organike të certifikuara",
    sub: "Të certifikuara ndërkombëtarisht",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.84 5.61a5.5 5.5 0 0 0-7.78 0L12 6.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 22.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    label: "Cruelty-free",
    sub: "Nuk testohen kurrë te kafshët",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 8h16l-2 8H6L4 8Z" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        <line x1="4" y1="4" x2="24" y2="24" strokeWidth="1.2" />
      </svg>
    ),
    label: "Pa plastikë",
    sub: "Vetëm paketim i qëndrueshëm",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s-8-4-8-12l8-3 8 3c0 8-8 12-8 12Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    label: "Jo toksike",
    sub: "Çdo përbërës i miratuar",
  },
]

export default function TrustBadges() {
  return (
    <section className="bg-white px-6 py-12 small:py-14" aria-label="Standardet tona">
      <Stagger
        stagger={0.08}
        role="list"
        className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 border-y border-yco-cream-dark py-10 md:grid-cols-4"
      >
        {badges.map((badge, index) => {
          const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length]

          return (
            <StaggerItem
              key={badge.label}
              role="listitem"
              className={`${accentClass} group flex flex-col items-center gap-4 text-center`}
            >
              <div className="grid h-14 w-14 place-items-center rounded-circle bg-[color:var(--accent-soft)] text-[color:var(--accent-ink)] transition-transform duration-300 group-hover:-translate-y-1">
                {badge.icon}
              </div>
              <div>
                <div className="font-sans text-sm font-bold tracking-wide text-yco-charcoal">
                  {badge.label}
                </div>
                <div className="mt-1 font-sans text-xs tracking-wide text-yco-charcoal-muted">
                  {badge.sub}
                </div>
              </div>
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}
