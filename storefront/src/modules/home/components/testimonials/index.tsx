import { Reveal, Stagger, StaggerItem } from "@modules/common/components/motion"
import { getGoogleReviews } from "@lib/data/featurable"

type DisplayReview = {
  id: string
  name: string
  detail: string
  rating: number
  text: string
  footnoteLabel: string
  footnoteValue: string
  url: string | null
}

// Curated quotes shown until the Google Business Profile is connected in Featurable.
const fallbackReviews: DisplayReview[] = [
  {
    id: "fallback-1",
    name: "Amelia R.",
    detail: "Tirana, AL",
    rating: 5,
    text: "Më në fund mund të shfletoj produkte organike të besuara në një vend dhe të porosis sërish produktet e përditshme pa dyshuar për origjinën e tyre.",
    footnoteLabel: "Blerë",
    footnoteValue: "Produktet e përditshme",
    url: null,
  },
  {
    id: "fallback-2",
    name: "Sofia M.",
    detail: "Durres, AL",
    rating: 5,
    text: "Përzgjedhja e brendeve duket e menduar mirë, faqet e produkteve janë të qarta dhe përditësimet e dërgesës e bënë porosinë të lehtë për t’u ndjekur.",
    footnoteLabel: "Blerë",
    footnoteValue: "Përzgjedhje clean beauty",
    url: null,
  },
  {
    id: "fallback-3",
    name: "Lea T.",
    detail: "Prishtina, XK",
    rating: 5,
    text: "YCO e bën të thjeshtë krahasimin e produkteve sipas kategorisë dhe brendit, pastaj rikthimin te i njëjti koleksion kur më duhet ta blej përsëri.",
    footnoteLabel: "Blerë",
    footnoteValue: "Rutina e riblerjes",
    url: null,
  },
]

// Full literal class names so Tailwind keeps these hand-written @layer rules.
const ACCENT_CLASSES = [
  "yco-accent--mint",
  "yco-accent--coral",
  "yco-accent--blue",
] as const

const SOCIAL_LINKS = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@ycorganics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.5 3c.3 2.1 1.5 3.7 3.5 4.1v3c-1.4.1-2.7-.3-3.9-1v6.6c0 3.4-2.6 5.8-5.8 5.8A5.6 5.6 0 0 1 4.7 16c0-3.3 3-5.9 6.4-5.3v3.1a2.6 2.6 0 0 0-1.1-.2 2.6 2.6 0 1 0 2.6 2.6V3h3.9Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ycorganics/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/ycorganic/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 8.5V6.7c0-.8.2-1.2 1.4-1.2H17V2.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v1.9H8v3h2.6V21H14v-8.5h2.5l.4-3H14Z" />
      </svg>
    ),
  },
] as const

const MAX_REVIEW_CHARS = 240

const truncate = (text: string) =>
  text.length > MAX_REVIEW_CHARS
    ? `${text.slice(0, MAX_REVIEW_CHARS).trimEnd()}…`
    : text

const relativeDate = (isoDate: string) => {
  const rtf = new Intl.RelativeTimeFormat("sq", { numeric: "auto" })
  const elapsedMs = Date.now() - new Date(isoDate).getTime()
  const days = Math.max(1, Math.floor(elapsedMs / 86_400_000))

  if (days < 30) return rtf.format(-days, "day")
  if (days < 365) return rtf.format(-Math.floor(days / 30), "month")
  return rtf.format(-Math.floor(days / 365), "year")
}

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

export default async function Testimonials() {
  const googleReviews = await getGoogleReviews()

  const reviews: DisplayReview[] = googleReviews
    ? googleReviews.reviews.slice(0, 3).map((review) => ({
        id: review.id,
        name: review.authorName,
        detail: relativeDate(review.publishedAt),
        rating: Math.round(review.rating),
        text: truncate(review.text),
        footnoteLabel: "Vlerësim",
        footnoteValue: "Google",
        url: review.url,
      }))
    : fallbackReviews

  const summaryRating = googleReviews
    ? `${googleReviews.averageRating.toLocaleString("sq")}/5`
    : "4.9/5"
  const summaryLabel = googleReviews
    ? `nga ${googleReviews.totalReviews} vlerësime në Google`
    : "nga mbi 2,000 klientë të verifikuar"

  return (
    <section className="yco-section bg-white/40 px-6 py-10 small:py-12">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="yco-section-title rhode-display font-hanken text-3xl md:text-4xl">Yco + you</h2>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="grid h-10 w-10 place-items-center rounded-circle border border-yco-cream-dark bg-white text-yco-charcoal transition-colors hover:bg-yco-charcoal hover:text-white"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </Reveal>

        <Stagger
          stagger={0.1}
          className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
        >
          {reviews.map((review, index) => {
            const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length]

            return (
            <StaggerItem
              key={review.id}
              className={`${accentClass} yco-accent-card flex w-[82%] shrink-0 snap-start flex-col gap-5 rounded-large p-8 md:w-auto md:shrink`}
            >
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
                    {review.detail}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-sans text-yco-charcoal-muted text-[10px] uppercase tracking-[0.12em]">
                    {review.footnoteLabel}
                  </div>
                  {review.url ? (
                    <a
                      href={review.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-yco-charcoal text-[11px] font-bold mt-0.5 leading-tight underline-offset-2 hover:underline"
                    >
                      {review.footnoteValue}
                    </a>
                  ) : (
                    <div className="font-sans text-yco-charcoal text-[11px] font-bold mt-0.5 leading-tight">
                      {review.footnoteValue}
                    </div>
                  )}
                </div>
              </div>
            </StaggerItem>
            )
          })}
        </Stagger>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <Stars count={5} />
          <span className="font-sans text-yco-charcoal text-sm font-bold">
            {summaryRating}
          </span>
          <span className="font-sans text-yco-charcoal-muted text-sm">
            {summaryLabel}
          </span>
        </div>
      </div>
    </section>
  )
}
