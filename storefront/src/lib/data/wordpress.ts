const WORDPRESS_BASE_URL = "https://ycorganics.com"

export type WordPressContentBlock =
  | {
      type: "heading"
      level: number
      text: string
    }
  | {
      type: "paragraph"
      text: string
    }
  | {
      type: "list"
      items: string[]
    }
  | {
      type: "image"
      src: string
      alt: string
    }

export type WordPressEntry = {
  id: number
  slug: string
  link: string
  title: {
    rendered: string
  }
  content?: {
    rendered: string
  }
  excerpt?: {
    rendered: string
  }
  date?: string
  modified?: string
}

export type NormalizedWordPressEntry = {
  id: number
  slug: string
  sourceUrl: string
  title: string
  excerpt: string
  date?: string
  modified?: string
  blocks: WordPressContentBlock[]
}

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  nbsp: " ",
  quot: "\"",
  apos: "'",
  "#039": "'",
  "#8211": "-",
  "#8212": "-",
  "#8217": "'",
  "#8220": "\"",
  "#8221": "\"",
}

function decodeHtml(value: string): string {
  return value.replace(/&([^;]+);/g, (match, entity) => {
    if (ENTITY_MAP[entity]) {
      return ENTITY_MAP[entity]
    }

    if (entity.startsWith("#x")) {
      return String.fromCharCode(parseInt(entity.slice(2), 16))
    }

    if (entity.startsWith("#")) {
      return String.fromCharCode(parseInt(entity.slice(1), 10))
    }

    return match
  })
}

function cleanText(value: string): string {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  )
}

function cleanHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
}

function getAttribute(value: string, name: string): string {
  const match = value.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))

  return match ? decodeHtml(match[1]) : ""
}

export function htmlToBlocks(html = ""): WordPressContentBlock[] {
  const cleaned = cleanHtml(html)
  const blocks: WordPressContentBlock[] = []
  const blockPattern =
    /<(h[1-4]|p|ul|ol|figure)[^>]*>([\s\S]*?)<\/\1>|<img[^>]+>/gi
  let match: RegExpExecArray | null

  while ((match = blockPattern.exec(cleaned))) {
    const raw = match[0]

    if (raw.toLowerCase().startsWith("<img")) {
      const src = getAttribute(raw, "src")

      if (src) {
        blocks.push({
          type: "image",
          src,
          alt: getAttribute(raw, "alt"),
        })
      }
      continue
    }

    const tag = match[1].toLowerCase()
    const body = match[2]

    if (tag === "figure") {
      const image = body.match(/<img[^>]+>/i)?.[0]
      const src = image ? getAttribute(image, "src") : ""

      if (src) {
        blocks.push({
          type: "image",
          src,
          alt: image ? getAttribute(image, "alt") : "",
        })
      }
      continue
    }

    if (tag === "ul" || tag === "ol") {
      const items: string[] = []
      const itemPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let itemMatch: RegExpExecArray | null

      while ((itemMatch = itemPattern.exec(body))) {
        const item = cleanText(itemMatch[1])

        if (item) {
          items.push(item)
        }
      }

      if (items.length) {
        blocks.push({ type: "list", items })
      }
      continue
    }

    const text = cleanText(body)

    if (!text) {
      continue
    }

    if (tag.startsWith("h")) {
      blocks.push({
        type: "heading",
        level: Number(tag.replace("h", "")),
        text,
      })
    } else {
      blocks.push({ type: "paragraph", text })
    }
  }

  if (!blocks.length) {
    const text = cleanText(cleaned)

    if (text) {
      blocks.push({ type: "paragraph", text })
    }
  }

  return dedupeConsecutiveBlocks(blocks)
}

function dedupeConsecutiveBlocks(
  blocks: WordPressContentBlock[]
): WordPressContentBlock[] {
  const output: WordPressContentBlock[] = []

  for (const block of blocks) {
    const previous = output[output.length - 1]

    if (
      previous &&
      previous.type === block.type &&
      "text" in previous &&
      "text" in block &&
      previous.text === block.text
    ) {
      continue
    }

    output.push(block)
  }

  return output
}

function normalizeEntry(entry: WordPressEntry): NormalizedWordPressEntry {
  const blocks = htmlToBlocks(entry.content?.rendered)
  const title = cleanText(entry.title?.rendered || "")
  const excerpt = cleanText(entry.excerpt?.rendered || "")

  return {
    id: entry.id,
    slug: entry.slug,
    sourceUrl: entry.link,
    title,
    excerpt,
    date: entry.date,
    modified: entry.modified,
    blocks,
  }
}

async function fetchWordPressCollection(
  type: "pages" | "posts",
  query = ""
): Promise<WordPressEntry[]> {
  const response = await fetch(
    `${WORDPRESS_BASE_URL}/wp-json/wp/v2/${type}?${query}`,
    {
      next: {
        revalidate: 3600,
        tags: ["wordpress-content"],
      },
    }
  )

  if (!response.ok) {
    return []
  }

  return response.json()
}

async function fetchAllWordPressEntries(type: "pages" | "posts") {
  const entries: WordPressEntry[] = []
  let page = 1

  while (true) {
    const batch = await fetchWordPressCollection(
      type,
      new URLSearchParams({
        per_page: "100",
        page: String(page),
        status: "publish",
        _fields: "id,slug,link,title,content,excerpt,date,modified",
      }).toString()
    )

    entries.push(...batch)

    if (batch.length < 100) {
      break
    }

    page += 1
  }

  return entries
}

export async function getWordPressPage(slug: string) {
  const pages = await fetchWordPressCollection(
    "pages",
    new URLSearchParams({
      slug,
      status: "publish",
      _fields: "id,slug,link,title,content,excerpt,date,modified",
    }).toString()
  )

  return pages[0] ? normalizeEntry(pages[0]) : null
}

export async function getWordPressPost(slug: string) {
  const posts = await fetchWordPressCollection(
    "posts",
    new URLSearchParams({
      slug,
      status: "publish",
      _fields: "id,slug,link,title,content,excerpt,date,modified",
    }).toString()
  )

  return posts[0] ? normalizeEntry(posts[0]) : null
}

export async function listWordPressPosts(limit = 12) {
  const posts =
    limit > 100
      ? (await fetchAllWordPressEntries("posts")).slice(0, limit)
      : await fetchWordPressCollection(
          "posts",
          new URLSearchParams({
            per_page: String(limit),
            status: "publish",
            _fields: "id,slug,link,title,content,excerpt,date,modified",
          }).toString()
        )

  return posts.map(normalizeEntry)
}

export async function listWordPressPages() {
  const pages = await fetchAllWordPressEntries("pages")

  return pages.map(normalizeEntry)
}

export async function listWordPressSlugs() {
  const [pages, posts] = await Promise.all([
    fetchAllWordPressEntries("pages"),
    fetchAllWordPressEntries("posts"),
  ])

  return [...pages, ...posts].map((entry) => entry.slug)
}
