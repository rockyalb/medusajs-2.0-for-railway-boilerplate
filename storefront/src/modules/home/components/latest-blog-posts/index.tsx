import {
  NormalizedWordPressEntry,
  formatWordPressDate,
  getWordPressEntryImage,
} from "@lib/data/wordpress"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LatestBlogPostsProps = {
  posts: NormalizedWordPressEntry[]
}

export default function LatestBlogPosts({ posts }: LatestBlogPostsProps) {
  if (!posts.length) {
    return null
  }

  return (
    <section className="bg-yco-panel px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-5 small:flex-row small:items-end small:justify-between">
          <div>
            <span className="rhode-eyebrow">Journal</span>
            <h2 className="rhode-display text-4xl md:text-5xl mt-3">
              latest from the blog
            </h2>
          </div>
          <LocalizedClientLink
            href="/blog"
            className="font-sans text-yco-charcoal text-xs tracking-[0.18em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-yco-coral hover:border-yco-coral transition-colors duration-300 w-fit"
          >
            View all
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-3 gap-5 mt-8">
          {posts.slice(0, 3).map((post) => {
            const image = getWordPressEntryImage(post)

            return (
              <article
                key={post.id}
                className="bg-white border border-yco-cream-dark rounded-base overflow-hidden flex flex-col min-h-full"
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
                  <p className="font-sans text-yco-green text-xs mb-3">
                    {formatWordPressDate(post.date)}
                  </p>
                  <h3 className="font-serif text-yco-charcoal text-2xl leading-tight">
                    <LocalizedClientLink
                      href={`/${post.slug}`}
                      className="hover:text-yco-coral transition-colors duration-300"
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
                    className="font-sans text-yco-charcoal text-xs tracking-[0.18em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-yco-coral hover:border-yco-coral transition-colors duration-300 inline-block mt-6 w-fit"
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
