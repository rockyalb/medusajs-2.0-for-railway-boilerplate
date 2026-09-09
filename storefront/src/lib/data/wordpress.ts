// Legacy WordPress content, ported into the repo from ycorganics.com before the
// old site shut down. Pages/posts live in ./cms-content/*.json and their images
// under storefront/public/cms/. The functions keep their original async
// signatures so callers didn't have to change when fetching was removed.
import pagesData from "./cms-content/pages.json"
import postsData from "./cms-content/posts.json"

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
      type: "faq"
      items: {
        question: string
        answer: WordPressContentBlock[]
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

const PAGES = pagesData as WordPressEntry[]
const POSTS = postsData as WordPressEntry[]

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  nbsp: " ",
  quot: '"',
  apos: "'",
  "#039": "'",
  "#8211": "-",
  "#8212": "-",
  "#8217": "'",
  "#8220": '"',
  "#8221": '"',
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
    .replace(/^(\d+[.)]|[-*•–—]|[✅✓✔●○■□▪▫◆◇]|[\u{1f300}-\u{1faff}])\s+/u, "")
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

function scanBlocks(cleaned: string): WordPressContentBlock[] {
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

  return blocks
}

/* ------------------------------------------------------------------ *
 * Elementor toggles / accordions
 *
 * FAQ entries were authored with Elementor's toggle widget. It emits a
 * wrapper div holding, per entry, a <div class="elementor-tab-title"> (the
 * question, wrapped in an <a class="elementor-toggle-title">) followed by a
 * sibling <div class="elementor-tab-content"> (the answer). The scanner
 * above only looks at headings, paragraphs and lists, so every question was
 * dropped and the answers ran together as unlabelled prose. This pass lifts
 * each pair out as a dedicated `faq` block instead.
 * ------------------------------------------------------------------ */

// Matches a single class token, so "elementor-toggle" doesn't also hit the
// widget wrapper's "elementor-widget-toggle".
const classToken = (name: string) =>
  `class=["'](?:[^"']*\\s)?${name}(?:\\s[^"']*)?["']`

const TOGGLE_GROUP = `<div[^>]*${classToken(
  "elementor-(?:toggle|accordion)"
)}[^>]*>`
const TAB_TITLE = `<div[^>]*${classToken("elementor-tab-title")}[^>]*>`
const TAB_CONTENT = `<div[^>]*${classToken("elementor-tab-content")}[^>]*>`

// Reads the body of a <div> whose opening tag ends at `start`, tracking
// nesting so inner divs don't end it early.
function readDiv(html: string, start: number) {
  const tagPattern = /<div\b[^>]*>|<\/div\s*>/gi
  tagPattern.lastIndex = start
  let depth = 1
  let match: RegExpExecArray | null

  while ((match = tagPattern.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1

    if (!depth) {
      return { inner: html.slice(start, match.index), end: tagPattern.lastIndex }
    }
  }

  return { inner: html.slice(start), end: html.length }
}

function toggleItems(group: string) {
  const titlePattern = new RegExp(TAB_TITLE, "gi")
  const contentPattern = new RegExp(TAB_CONTENT, "gi")
  const titles: { start: number; end: number }[] = []
  let match: RegExpExecArray | null

  while ((match = titlePattern.exec(group))) {
    titles.push({ start: match.index, end: titlePattern.lastIndex })
  }

  return titles.flatMap(({ end }, index) => {
    const question = cleanText(readDiv(group, end).inner)

    if (!question) {
      return []
    }

    // The answer is the next content div, but only if it still belongs to
    // this item rather than to the one after it.
    const limit = titles[index + 1]?.start ?? group.length
    contentPattern.lastIndex = end
    const content = contentPattern.exec(group)
    const answer =
      content && content.index < limit
        ? scanBlocks(readDiv(group, contentPattern.lastIndex).inner)
        : []

    return [{ question, answer }]
  })
}

// Splits the document into plain-html runs and the faq blocks between them,
// so toggle content keeps its position relative to the surrounding copy.
function splitToggleGroups(html: string): (string | WordPressContentBlock)[] {
  const segments: (string | WordPressContentBlock)[] = []
  const groupPattern = new RegExp(TOGGLE_GROUP, "gi")
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = groupPattern.exec(html))) {
    const group = readDiv(html, groupPattern.lastIndex)
    const items = toggleItems(group.inner)

    if (items.length) {
      segments.push(html.slice(cursor, match.index))
      segments.push({ type: "faq", items })
      cursor = group.end
    }

    groupPattern.lastIndex = group.end
  }

  segments.push(html.slice(cursor))

  return segments
}

export function htmlToBlocks(html = ""): WordPressContentBlock[] {
  const cleaned = cleanHtml(html)
  const blocks: WordPressContentBlock[] = []

  for (const segment of splitToggleGroups(cleaned)) {
    blocks.push(...(typeof segment === "string" ? scanBlocks(segment) : [segment]))
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

// Some legacy slugs contain percent-encoded emoji; URL params may arrive either
// encoded or decoded depending on how the link was entered.
function slugMatches(entrySlug: string, requested: string) {
  if (entrySlug === requested) {
    return true
  }

  try {
    return decodeURIComponent(entrySlug) === decodeURIComponent(requested)
  } catch {
    return false
  }
}

export async function getWordPressPage(slug: string) {
  const page = PAGES.find((entry) => slugMatches(entry.slug, slug))

  return page ? normalizeEntry(page) : null
}

export async function getWordPressPost(slug: string) {
  const post = POSTS.find((entry) => slugMatches(entry.slug, slug))

  return post ? normalizeEntry(post) : null
}

function postsByDateDesc() {
  return [...POSTS].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? "")
  )
}

export async function listWordPressPosts(limit = 12) {
  return postsByDateDesc().slice(0, limit).map(normalizeEntry)
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
  return PAGES.map(normalizeEntry)
}

export async function listWordPressSlugs() {
  return [...PAGES, ...POSTS].map((entry) => entry.slug)
}
