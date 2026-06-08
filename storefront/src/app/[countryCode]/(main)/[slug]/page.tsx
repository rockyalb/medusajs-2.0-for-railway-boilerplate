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
  listWordPressSlugs,
} from "@lib/data/wordpress"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type PageProps = {
  params: {
    countryCode: string
    slug: string
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  if (params.slug === "blog") {
    return {
      title: "Blog | YCO",
      description: "Artikuj nga YCO Organics.",
    }
  }

  const entry =
    (await getWordPressPage(params.slug)) || (await getWordPressPost(params.slug))

  if (!entry) {
    return {}
  }

  return {
    title: `${entry.title} | YCO`,
    description: entry.excerpt || `${entry.title} nga YCO Organics.`,
  }
}

export async function generateStaticParams() {
  const slugs = await listWordPressSlugs()

  return [
    { countryCode: "al", slug: "blog" },
    ...slugs.map((slug) => ({
      countryCode: "al",
      slug,
    })),
  ]
}

export default async function LegacyWordPressRoute({ params }: PageProps) {
  if (params.slug === "blog") {
    const posts = await listWordPressPosts()
    return <BlogIndex posts={posts} />
  }

  const page = await getWordPressPage(params.slug)
  const post = page ? null : await getWordPressPost(params.slug)
  const entry = page || post

  if (!entry) {
    notFound()
  }

  return (
    <main className="bg-yco-cream min-h-screen">
      <article className="content-container py-14 small:py-20">
        <div className="max-w-3xl">
          <span className="font-sans text-yco-green text-xs tracking-[0.24em] uppercase font-medium">
            {post ? "Blog" : "YCO"}
          </span>
          <h1 className="font-serif text-yco-charcoal text-4xl small:text-6xl leading-tight mt-4">
            {entry.title}
          </h1>
          {entry.excerpt && (
            <p className="font-sans text-yco-charcoal-muted text-base leading-7 mt-5 max-w-2xl">
              {entry.excerpt}
            </p>
          )}
        </div>

        <div className="max-w-3xl mt-12">
          <ContentBlocks blocks={entry.blocks} />
        </div>
      </article>
    </main>
  )
}

function BlogIndex({ posts }: { posts: NormalizedWordPressEntry[] }) {
  return (
    <main className="bg-yco-cream min-h-screen">
      <section className="content-container py-14 small:py-20">
        <div className="max-w-3xl">
          <span className="font-sans text-yco-green text-xs tracking-[0.24em] uppercase font-medium">
            Journal
          </span>
          <h1 className="font-serif text-yco-charcoal text-4xl small:text-6xl leading-tight mt-4">
            Blog
          </h1>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-2 gap-5 mt-12">
          {posts.map((post) => {
            const image = getWordPressEntryImage(post)

            return (
              <article
                key={post.id}
                className="bg-white border border-yco-cream-dark rounded-base overflow-hidden flex flex-col"
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
                  <h2 className="font-serif text-yco-charcoal text-2xl leading-tight">
                    <LocalizedClientLink
                      href={`/${post.slug}`}
                      className="hover:text-yco-coral transition-colors duration-300"
                    >
                      {post.title}
                    </LocalizedClientLink>
                  </h2>
                  {post.excerpt && (
                    <p className="font-sans text-yco-charcoal-muted text-sm leading-6 mt-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <LocalizedClientLink
                    href={`/${post.slug}`}
                    className="font-sans text-yco-charcoal text-xs tracking-[0.18em] uppercase font-medium border-b border-yco-charcoal pb-0.5 hover:text-yco-coral hover:border-yco-coral transition-colors duration-300 inline-block mt-6 w-fit"
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

function ContentBlocks({ blocks }: { blocks: WordPressContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = block.level <= 2 ? "h2" : "h3"
          return (
            <Heading
              key={`${block.type}-${index}`}
              className="font-serif text-yco-charcoal text-2xl small:text-3xl leading-tight pt-4"
            >
              {block.text}
            </Heading>
          )
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul"

          return (
            <List
              key={`${block.type}-${index}`}
              className={`pl-5 space-y-2 font-sans text-yco-charcoal-muted text-base leading-7 ${
                block.ordered ? "list-decimal" : "list-disc"
              }`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{item}</li>
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
              className="w-full h-auto rounded-md border border-yco-cream-dark"
              loading="lazy"
            />
          )
        }

        if (block.type === "imageGroup") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="grid grid-cols-1 small:grid-cols-2 gap-4"
            >
              {block.images.map((image, imageIndex) => (
                <img
                  key={`${image.src}-${imageIndex}`}
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto rounded-base border border-yco-cream-dark"
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
              className="border-yco-cream-dark my-10"
            />
          )
        }

        return (
          <p
            key={`${block.type}-${index}`}
            className="font-sans text-yco-charcoal-muted text-base leading-7"
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
