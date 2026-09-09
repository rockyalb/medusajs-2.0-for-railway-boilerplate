import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  NormalizedWordPressEntry,
  WordPressContentBlock,
  formatWordPressDate,
  getWordPressPage,
  getWordPressPost,
  getWordPressEntryImage,
  listWordPressPosts,
} from "@lib/data/wordpress"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type PageProps = {
  params: Promise<{
    countryCode: string
    slug: string
  }>
}

/* ------------------------------------------------------------------ *
 * Legacy Elementor cleanup
 *
 * The imported WordPress pages were built in Elementor, which splits a
 * page title across several <h1> blocks, echoes the title again lower
 * down, wraps body copy in <h4>, and scatters decorative "~" glyphs and
 * placeholder images through the markup. These helpers normalise that
 * mess into a clean hero subtitle + a tidy list of content blocks so
 * every page renders as a polished, sectioned document.
 * ------------------------------------------------------------------ */

// Short connective words ignored when comparing a heading against the title.
const STOP = new Set([
  "dhe", "and", "of", "the", "e", "te", "të", "a", "per", "për", "në", "ne",
])

const wordsOf = (value: string): string[] =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((word) => word && !STOP.has(word))

// Two words count as the same if they're equal or share a 5-letter stem,
// so plural/typo variants ("cancelation" vs "cancellations") still match.
const wordMatches = (a: string, b: string) =>
  a === b || (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5))

// Is `fragment` essentially a restatement of the page `title`?
const echoesTitle = (fragment: string, title: string) => {
  const words = wordsOf(fragment)
  const titleWords = wordsOf(title)

  if (!words.length || !titleWords.length) {
    return false
  }

  const hits = words.filter((w) => titleWords.some((t) => wordMatches(w, t)))
  return hits.length / words.length >= 0.6
}

// Strip decorative "~" separators and normalise stray whitespace/commas.
const tidy = (value = "") =>
  value
    .replace(/\s*~\s*/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim()

const isShoutyHeading = (block: WordPressContentBlock) =>
  block.type === "heading" &&
  block.text.length >= 3 &&
  block.text.length <= 28 &&
  /[a-z]/i.test(block.text) &&
  block.text === block.text.toUpperCase()

type BadgeBlock = { type: "badges"; items: string[] }
type RenderBlock = WordPressContentBlock | BadgeBlock

type RefinedEntry = {
  subtitle: string
  blocks: RenderBlock[]
}

function refineEntry(
  title: string,
  blocks: WordPressContentBlock[]
): RefinedEntry {
  // 1. Peel off the leading <h1> run — that's Elementor's title area. Reuse it
  //    as a hero subtitle only when it says something new (not the title again).
  let cursor = 0
  const lead: WordPressContentBlock[] = []
  while (
    cursor < blocks.length &&
    blocks[cursor].type === "heading" &&
    (blocks[cursor] as { level: number }).level === 1
  ) {
    lead.push(blocks[cursor])
    cursor++
  }

  const leadText = tidy(
    lead.map((b) => ("text" in b ? b.text : "")).join(" ")
  )
  const subtitle = leadText && !echoesTitle(leadText, title) ? leadText : ""

  let body = blocks.slice(cursor)

  // 2. Drop any remaining heading that just repeats the title.
  body = body.filter(
    (b) => !(b.type === "heading" && echoesTitle(b.text, title))
  )

  // 3. Tidy every text-bearing block; demote long "headings" (body copy that
  //    Elementor wrapped in <h3>/<h4>) back to paragraphs.
  const cleaned: WordPressContentBlock[] = []
  for (const block of body) {
    if (block.type === "heading") {
      const text = tidy(block.text)
      if (!text) continue
      if (block.level >= 3 && text.length > 70) {
        cleaned.push({ type: "paragraph", text })
      } else {
        cleaned.push({ ...block, text })
      }
      continue
    }

    if (block.type === "paragraph") {
      const text = tidy(block.text)
      if (!text) continue
      cleaned.push({
        ...block,
        text,
        lines: block.lines?.map(tidy).filter(Boolean),
      })
      continue
    }

    if (block.type === "list") {
      const items = block.items.map(tidy).filter(Boolean)
      if (items.length) cleaned.push({ ...block, items })
      continue
    }

    if (block.type === "image") {
      // Skip Elementor's decorative oval spacers, and collapse a repeated image.
      if (/oval\.svg$/i.test(block.src)) continue
      const prev = cleaned[cleaned.length - 1]
      if (prev && prev.type === "image" && prev.src === block.src) continue
      cleaned.push(block)
      continue
    }

    cleaned.push(block)
  }

  // 4. Group consecutive all-caps mini-headings into a single badge row.
  const grouped: RenderBlock[] = []
  for (let i = 0; i < cleaned.length; i++) {
    if (isShoutyHeading(cleaned[i])) {
      const run: string[] = []
      while (i < cleaned.length && isShoutyHeading(cleaned[i])) {
        run.push((cleaned[i] as { text: string }).text)
        i++
      }
      i--
      if (run.length >= 2) {
        grouped.push({ type: "badges", items: run })
        continue
      }
    }
    grouped.push(cleaned[i])
  }

  return { subtitle, blocks: grouped }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  if (slug === "blog") {
    return {
      title: "Blog | YCO",
      description: "Artikuj nga YCO Organics.",
    }
  }

  const entry =
    (await getWordPressPage(slug)) || (await getWordPressPost(slug))

  if (!entry) {
    return {}
  }

  return {
    title: `${entry.title} | YCO`,
    description: entry.excerpt || `${entry.title} nga YCO Organics.`,
  }
}

export async function generateStaticParams() {
  return [{ countryCode: "al", slug: "blog" }]
}

export default async function LegacyWordPressRoute({ params }: PageProps) {
  const { slug } = await params

  if (slug === "blog") {
    const posts = await listWordPressPosts()
    return <BlogIndex posts={posts} />
  }

  const page = await getWordPressPage(slug)
  const post = page ? null : await getWordPressPost(slug)
  const entry = page || post

  if (!entry) {
    notFound()
  }

  const { subtitle, blocks } = refineEntry(entry.title, entry.blocks)

  return (
    <main className="min-h-screen">
      {/* The title sits on the page's own ambient wash and lines up with the
          article column below it — no filled banner, no second title area. */}
      <header className="content-container pt-10 small:pt-16">
        <div className="mx-auto max-w-3xl">
          {post && (
            <p className="rhode-eyebrow inline-flex items-center gap-2">
              <span className="yco-accent-dot" aria-hidden />
              Journal
            </p>
          )}
          <h1
            className={`rhode-display text-[clamp(1.9rem,5.2vw,3.25rem)] leading-[1.08] ${
              post ? "mt-4" : ""
            }`}
          >
            {tidy(entry.title)}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-yco-charcoal-muted small:text-lg">
              {subtitle}
            </p>
          )}
          {post && entry.date && (
            <p className="rhode-eyebrow mt-5">
              {formatWordPressDate(entry.date)}
            </p>
          )}
        </div>
      </header>

      <section className="content-container py-8 small:py-12">
        <article className="mx-auto max-w-3xl rounded-large border border-yco-cream-dark bg-white/80 p-7 shadow-sm backdrop-blur small:p-12">
          <ContentBlocks blocks={blocks} />
        </article>
      </section>
    </main>
  )
}

function BlogIndex({ posts }: { posts: NormalizedWordPressEntry[] }) {
  return (
    <main className="min-h-screen">
      <header className="content-container pt-10 small:pt-16">
        <div className="max-w-3xl">
          <p className="rhode-eyebrow inline-flex items-center gap-2">
            <span className="yco-accent-dot" aria-hidden />
            Journal
          </p>
          <h1 className="rhode-display mt-4 text-[clamp(1.9rem,5.2vw,3.25rem)] leading-[1.08]">
            Blog
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-yco-charcoal-muted small:text-lg">
            Udhëzues, këshilla dhe histori nga bota e kujdesit organik.
          </p>
        </div>
      </header>

      <section className="content-container py-10 small:py-14">
        <div className="grid grid-cols-1 gap-5 medium:grid-cols-2">
          {posts.map((post) => {
            const image = getWordPressEntryImage(post)

            return (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden rounded-large border border-yco-cream-dark bg-white/40 backdrop-blur transition-shadow duration-300 hover:shadow-md"
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
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-3 font-sans text-xs text-yco-green">
                    {formatWordPressDate(post.date)}
                  </p>
                  <h2 className="font-serif text-2xl leading-tight text-yco-charcoal">
                    <LocalizedClientLink
                      href={`/${post.slug}`}
                      className="transition-colors duration-300 hover:text-yco-coral"
                    >
                      {post.title}
                    </LocalizedClientLink>
                  </h2>
                  {post.excerpt && (
                    <p className="mt-4 line-clamp-3 font-sans text-sm leading-6 text-yco-charcoal-muted">
                      {post.excerpt}
                    </p>
                  )}
                  <LocalizedClientLink
                    href={`/${post.slug}`}
                    className="mt-6 inline-block w-fit border-b border-yco-charcoal pb-0.5 font-sans text-xs font-medium uppercase tracking-[0.18em] text-yco-charcoal transition-colors duration-300 hover:border-yco-coral hover:text-yco-coral"
                  >
                    Lexo me shume
                  </LocalizedClientLink>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function ContentBlocks({ blocks }: { blocks: RenderBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "badges") {
          return (
            <ul
              key={`badges-${index}`}
              className="flex flex-wrap gap-2.5 py-1"
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${item}-${itemIndex}`}
                  className="inline-flex items-center rounded-circle border border-yco-cream-dark bg-yco-panel px-4 py-2 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-yco-charcoal"
                >
                  {item}
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === "faq") {
          return (
            <div key={`faq-${index}`} className="space-y-3 pt-2">
              {block.items.map((item, itemIndex) => (
                <details
                  key={`${item.question}-${itemIndex}`}
                  className="group rounded-large border border-yco-cream-dark bg-white/60 px-5 py-4 transition-colors duration-300 open:bg-yco-panel small:px-6 small:py-5"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-4 font-serif text-lg leading-snug text-yco-charcoal transition-colors duration-300 hover:text-yco-coral [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{tidy(item.question)}</span>
                    <span
                      className="relative mt-2 h-3 w-3 shrink-0 text-yco-green"
                      aria-hidden
                    >
                      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:scale-y-0" />
                    </span>
                  </summary>
                  <div className="mt-4 border-t border-yco-cream-dark pt-4">
                    <ContentBlocks blocks={item.answer} />
                  </div>
                </details>
              ))}
            </div>
          )
        }

        if (block.type === "heading") {
          if (block.level <= 2) {
            return (
              <h2
                key={`${block.type}-${index}`}
                className="flex items-baseline gap-3 pt-6 font-serif text-2xl leading-tight text-yco-charcoal small:text-3xl"
              >
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-circle bg-yco-green"
                  aria-hidden
                />
                {block.text}
              </h2>
            )
          }

          return (
            <h3
              key={`${block.type}-${index}`}
              className="pt-4 font-serif text-xl leading-tight text-yco-charcoal"
            >
              {block.text}
            </h3>
          )
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul"

          return (
            <List
              key={`${block.type}-${index}`}
              className={`space-y-2.5 pl-1 font-sans text-base leading-7 text-yco-charcoal-muted ${
                block.ordered ? "list-inside list-decimal" : "list-none"
              }`}
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${item}-${itemIndex}`}
                  className={block.ordered ? "" : "flex gap-3"}
                >
                  {!block.ordered && (
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-circle bg-yco-coral"
                      aria-hidden
                    />
                  )}
                  <span>{item}</span>
                </li>
              ))}
            </List>
          )
        }

        if (block.type === "image") {
          return (
            <img
              key={`${block.type}-${index}`}
              src={block.src}
              alt={block.alt}
              className="w-full rounded-large border border-yco-cream-dark shadow-sm"
              loading="lazy"
            />
          )
        }

        if (block.type === "imageGroup") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="grid grid-cols-1 gap-4 small:grid-cols-2"
            >
              {block.images.map((image, imageIndex) => (
                <img
                  key={`${image.src}-${imageIndex}`}
                  src={image.src}
                  alt={image.alt}
                  className="w-full rounded-large border border-yco-cream-dark shadow-sm"
                  loading="lazy"
                />
              ))}
            </div>
          )
        }

        if (block.type === "separator") {
          return (
            <hr
              key={`${block.type}-${index}`}
              className="my-10 border-yco-cream-dark"
            />
          )
        }

        return (
          <p
            key={`${block.type}-${index}`}
            className="font-sans text-base leading-7 text-yco-charcoal-muted"
          >
            {block.lines?.length
              ? block.lines.map((line, lineIndex) => (
                  <span key={`${line}-${lineIndex}`}>
                    {line}
                    {lineIndex < (block.lines?.length ?? 0) - 1 && <br />}
                  </span>
                ))
              : block.text}
          </p>
        )
      })}
    </div>
  )
}
