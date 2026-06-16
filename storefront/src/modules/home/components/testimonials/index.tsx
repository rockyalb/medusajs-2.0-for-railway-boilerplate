import { Reveal, Stagger, StaggerItem } from "@modules/common/components/motion"

const reviews = [
  {
    name: "Amelia R.",
    location: "Tirana, AL",
    rating: 5,
    text: "Më në fund mund të shfletoj produkte organike të besuara në një vend dhe të porosis sërish produktet e përditshme pa dyshuar për origjinën e tyre.",
    product: "Produktet e përditshme",
  },
  {
    name: "Sofia M.",
    location: "Durres, AL",
    rating: 5,
    text: "Përzgjedhja e brendeve duket e menduar mirë, faqet e produkteve janë të qarta dhe përditësimet e dërgesës e bënë porosinë të lehtë për t’u ndjekur.",
    product: "Përzgjedhje clean beauty",
  },
  {
    name: "Lea T.",
    location: "Prishtina, XK",
    rating: 5,
    text: "YCO e bën të thjeshtë krahasimin e produkteve sipas kategorisë dhe brendit, pastaj rikthimin te i njëjti koleksion kur më duhet ta blej përsëri.",
    product: "Rutina e riblerjes",
  },
]

// Full literal class names so Tailwind keeps these hand-written @layer rules.
const ACCENT_CLASSES = [
  "yco-accent--mint",
  "yco-accent--coral",
  "yco-accent--blue",
] as const

const Stars = ({
  count,
  className = "text-yco-charcoal",
}: {
  count: number
  className?: string
}) => (
  <div className={`flex gap-1 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
      >
        <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1Z" />
      </svg>
    ))}
  </div>
)

export default function Testimonials() {
  return (
    <section className="bg-white px-6 py-14 small:py-16">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="rhode-display text-4xl md:text-5xl">yco + you</h2>
            <div className="yco-tricolor-rule mt-4" />
            <div className="mt-5 overflow-hidden rounded-large bg-yco-panel md:hidden">
              <img
                src="/placeholder-images/yco-real/community.jpg"
                alt="Fotografi lifestyle e komunitetit YCO"
                className="h-36 w-full object-cover"
              />
            </div>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rhode-pill self-start sm:self-auto"
          >
            Na gjeni në rrjete sociale
          </a>
        </Reveal>

        <Stagger
          stagger={0.1}
          className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        >
          {reviews.map((review, index) => {
            const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length]

            return (
            <StaggerItem
              key={review.name}
              className={`${accentClass} yco-accent-card flex flex-col gap-5 rounded-large p-8`}
            >
              <img
                src="/placeholder-images/yco-real/community.jpg"
                alt={`${review.name} fotografi lifestyle klienti`}
                className="h-28 w-full rounded-rounded object-cover"
              />
              <Stars
                count={review.rating}
                className="text-[color:var(--accent)]"
              />
              <blockquote className="flex-1 font-sans text-yco-charcoal text-sm leading-[1.8]">
                &quot;{review.text}&quot;
              </blockquote>
              <div className="flex items-center justify-between border-t border-yco-cream-dark pt-5">
                <div>
                  <div className="font-sans text-yco-charcoal text-sm font-bold">
                    {review.name}
                  </div>
                  <div className="font-sans text-yco-charcoal-muted text-xs mt-0.5">
                    {review.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-sans text-yco-charcoal-muted text-[10px] uppercase tracking-[0.12em]">
                    Blerë
                  </div>
                  <div className="font-sans text-yco-charcoal text-[11px] font-bold mt-0.5 leading-tight">
                    {review.product}
                  </div>
                </div>
              </div>
            </StaggerItem>
            )
          })}
        </Stagger>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <Stars count={5} />
          <span className="font-sans text-yco-charcoal text-sm font-bold">
            4.9/5
          </span>
          <span className="font-sans text-yco-charcoal-muted text-sm">
            nga mbi 2,000 klientë të verifikuar
          </span>
        </div>
      </div>
    </section>
  )
}
