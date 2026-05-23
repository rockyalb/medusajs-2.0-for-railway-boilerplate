const badges = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3C14 3 6 7 6 14a8 8 0 0 0 16 0c0-7-8-11-8-11Z" />
        <path d="M14 3v18" />
        <path d="M10 10c1.5 1.5 2.5 3 4 4" />
        <path d="M18 10c-1.5 1.5-2.5 3-4 4" />
      </svg>
    ),
    label: "Certified Organic",
    sub: "Internationally certified",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 5.61a5.5 5.5 0 0 0-7.78 0L12 6.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 22.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    label: "Cruelty-Free",
    sub: "Never tested on animals",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h16l-2 8H6L4 8Z" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        <line x1="4" y1="4" x2="24" y2="24" strokeWidth="1.2" />
      </svg>
    ),
    label: "Plastic-Free",
    sub: "Sustainable packaging only",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4-8-12l8-3 8 3c0 8-8 12-8 12Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    label: "Non-Toxic",
    sub: "Every ingredient approved",
  },
]

export default function TrustBadges() {
  return (
    <section className="bg-yco-green py-10 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {badges.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center text-center gap-3 group">
            <div className="text-yco-cream group-hover:text-yco-coral transition-colors duration-300">
              {badge.icon}
            </div>
            <div>
              <div className="text-yco-charcoal font-sans font-medium text-sm tracking-wide">
                {badge.label}
              </div>
              <div className="text-yco-charcoal-muted font-sans text-xs mt-0.5 tracking-wide">
                {badge.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
