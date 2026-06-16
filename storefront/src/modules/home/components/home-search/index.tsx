import Link from "next/link"

export default function HomeSearch() {
  if (process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED === "false") {
    return null
  }

  return (
    <section className="bg-yco-cream px-6 py-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/search"
          scroll={false}
          className="group flex min-h-[64px] items-center justify-between rounded-large border border-yco-cream-dark bg-white px-5 transition-colors duration-300 hover:border-yco-charcoal"
          aria-label="Kërko produkte"
        >
          <span className="flex items-center gap-3 font-sans text-sm text-yco-charcoal-muted">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" strokeLinecap="round" />
            </svg>
            Kërko produkte, brende dhe kategori
          </span>
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal transition-colors duration-300 group-hover:text-yco-coral">
            Kërko
          </span>
        </Link>
      </div>
    </section>
  )
}
