import {
  NormalizedWordPressEntry,
  formatWordPressDate,
  getWordPressEntryImage,
} from "@lib/data/wordpress"
import Image from "next/image"
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
    <section className="bg-yco-panel px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-5 small:flex-row small:items-end small:justify-between">
          <div>
            <span className="rhode-eyebrow inline-flex items-center gap-2">
              <span className="yco-accent-dot" aria-hidden />
              Journal
            </span>
            <h2 className="rhode-display text-4xl md:text-5xl mt-3">
              latest from the blog
            </h2>
            <div className="yco-tricolor-rule mt-4" />
          </div>
          <LocalizedClientLink
            href="/blog"
            className="font-sans text-yco-charcoal text-xs tracking-[0.18em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-pastel-coral-ink hover:border-pastel-coral-ink transition-colors duration-300 w-fit"
          >
            View all
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-3 gap-5 mt-8">
          {posts.slice(0, 3).map((post, index) => {
            const image = getWordPressEntryImage(post)
            const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length]

            return (
              <article
                key={post.id}
                className={`${accentClass} group bg-white border border-yco-cream-dark border-t-[3px] border-t-[color:var(--accent)] rounded-base overflow-hidden flex flex-col min-h-full transition-shadow duration-300 hover:shadow-[0_22px_46px_-24px_var(--accent-glow)]`}
              >
                {image && (
                  <LocalizedClientLink
                    href={`/${post.slug}`}
                    className="relative block aspect-[4/3] overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt=""
                      className="object-cover"
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
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
                    Read more
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
