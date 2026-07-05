import {
  NormalizedWordPressEntry,
  formatWordPressDate,
  getWordPressEntryImage,
} from "@lib/data/wordpress"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LatestBlogPostsProps = {
  posts: NormalizedWordPressEntry[]
}

// Full literal class names so Tailwind keeps these hand-written @layer rules.
const ACCENT_CLASSES = [
  "yco-accent--mint",
  "yco-accent--coral",
  "yco-accent--blue",
] as const

export default function LatestBlogPosts({ posts }: LatestBlogPostsProps) {
  if (!posts.length) {
    return null
  }

  return (
    <section className="yco-section bg-yco-panel/50 px-6 py-10 small:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-5 small:flex-row small:items-end small:justify-between">
          <div className="font-hanken">
            <h2 className="yco-section-title rhode-display text-3xl md:text-4xl">
              Më të fundit nga blogu
            </h2>
          </div>
          <LocalizedClientLink
            href="/blog"
            className="font-sans text-yco-charcoal text-xs tracking-[0.18em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-pastel-coral-ink hover:border-pastel-coral-ink transition-colors duration-300 w-fit"
          >
            Shiko të gjitha
          </LocalizedClientLink>
        </div>

        <div className="-mx-6 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 small:mt-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden medium:mx-0 medium:grid medium:grid-cols-3 medium:overflow-visible medium:px-0 medium:pb-0">
          {posts.slice(0, 3).map((post, index) => {
            const image = getWordPressEntryImage(post)
            const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length]

            return (
              <article
                key={post.id}
                className={`${accentClass} group flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-base border border-yco-cream-dark border-t-[3px] border-t-[color:var(--accent)] bg-white transition-shadow duration-300 hover:shadow-[0_22px_46px_-24px_var(--accent-glow)] medium:w-auto medium:min-h-full medium:shrink`}
              >
                {image && (
                  <LocalizedClientLink href={`/${post.slug}`}>
                    <img
                      src={image}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  </LocalizedClientLink>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <p className="font-sans text-[color:var(--accent-ink)] text-xs font-semibold mb-3">
                    {formatWordPressDate(post.date)}
                  </p>
                  <h3 className="font-serif text-yco-charcoal text-2xl leading-tight">
                    <LocalizedClientLink
                      href={`/${post.slug}`}
                      className="hover:text-[color:var(--accent-ink)] transition-colors duration-300"
                    >
                      {post.title}
                    </LocalizedClientLink>
                  </h3>
                  {post.excerpt && (
                    <p className="font-sans text-yco-charcoal-muted text-sm leading-6 mt-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <LocalizedClientLink
                    href={`/${post.slug}`}
                    className="font-sans text-yco-charcoal text-xs tracking-[0.18em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-[color:var(--accent-ink)] hover:border-[color:var(--accent-ink)] transition-colors duration-300 inline-block mt-6 w-fit"
                  >
                    Lexo më shumë
                  </LocalizedClientLink>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
