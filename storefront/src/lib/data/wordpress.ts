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
      lines?: string[]
    }
  | {
      type: "list"
      items: string[]
      ordered?: boolean
    }
  | {
      type: "image"
      src: string
      alt: string
    }
  | {
      type: "imageGroup"
      images: {
        src: string
        alt: string
      }[]
    }
  | {
      type: "separator"
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
  "#8230": "...",
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

function stripTags(value: string): string {
  return decodeHtml(
    value
      .replace(/<\/(p|div|li|h[1-6]|figcaption)>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim()
  )
}

function cleanText(value: string): string {
  return stripTags(value.replace(/<br\s*\/?>/gi, " "))
}

function cleanLine(value: string): string {
  return stripTags(value).replace(/\s+/g, " ").trim()
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

function getImages(value: string) {
  const images: { src: string; alt: string }[] = []
  const imagePattern = /<img[^>]+>/gi
  let imageMatch: RegExpExecArray | null

  while ((imageMatch = imagePattern.exec(value))) {
    const image = imageMatch[0]
    const src = getAttribute(image, "src")

    if (src) {
      images.push({
        src,
        alt: getAttribute(image, "alt"),
      })
    }
  }

  return images
}

function isBulletLine(value: string) {
  return /^(\d+[.)]|[-*•–—]|[✅✓✔●○■□▪▫◆◇]|[\u{1f300}-\u{1faff}])\s+/u.test(
    value
  )
}

function normalizeBulletLine(value: string) {
  return value
    .replace(
      /^(\d+[.)]|[-*•–—]|[✅✓✔●○■□▪▫◆◇]|[\u{1f300}-\u{1faff}])\s+/u,
      ""
    )
    .trim()
}

function paragraphToBlocks(body: string): WordPressContentBlock[] {
  const lines = body
    .split(/<br\s*\/?>/i)
    .map(cleanLine)
    .filter(Boolean)

  if (!lines.length) {
    return []
  }

  if (lines.length > 1 && lines.every(isBulletLine)) {
    return [
      {
        type: "list",
        items: lines.map(normalizeBulletLine).filter(Boolean),
      },
    ]
  }

  const text = lines.join(" ")

  if (!text) {
    return []
  }

  return [
    {
      type: "paragraph",
      text,
      lines: lines.length > 1 ? lines : undefined,
    },
  ]
}

export function htmlToBlocks(html = ""): WordPressContentBlock[] {
  const cleaned = cleanHtml(html)
  const blocks: WordPressContentBlock[] = []
  const blockPattern =
    /<(h[1-4]|p|ul|ol|figure)[^>]*>([\s\S]*?)<\/\1>|<hr[^>]*>|<img[^>]+>/gi
  let match: RegExpExecArray | null

  while ((match = blockPattern.exec(cleaned))) {
    const raw = match[0]

    if (raw.toLowerCase().startsWith("<img")) {
      const images = getImages(raw)

      if (images[0]) {
        blocks.push({ type: "image", ...images[0] })
      }
      continue
    }

    if (raw.toLowerCase().startsWith("<hr")) {
      blocks.push({ type: "separator" })
      continue
    }

    const tag = match[1].toLowerCase()
    const body = match[2]

    if (tag === "figure") {
      const images = getImages(body)

      if (images.length === 1) {
        blocks.push({ type: "image", ...images[0] })
      } else if (images.length > 1) {
        blocks.push({ type: "imageGroup", images })
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
        blocks.push({ type: "list", items, ordered: tag === "ol" })
      }
      continue
    }

    if (tag === "p") {
      blocks.push(...paragraphToBlocks(body))
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

function firstImageFromBlocks(blocks: WordPressContentBlock[]) {
  for (const block of blocks) {
    if (block.type === "image") {
      return block.src
    }

    if (block.type === "imageGroup") {
      return block.images[0]?.src || ""
    }
  }

  return ""
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
            order: "desc",
            orderby: "date",
            _fields: "id,slug,link,title,content,excerpt,date,modified",
          }).toString()
        )

  return posts.map(normalizeEntry)
}

export function getWordPressEntryImage(entry: NormalizedWordPressEntry) {
  return firstImageFromBlocks(entry.blocks)
}

export function formatWordPressDate(date?: string) {
  if (!date) {
    return "YCO"
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
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
