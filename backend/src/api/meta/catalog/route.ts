import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type FeedMetadata = Record<string, unknown>

const xmlEscape = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const getStorefrontUrl = () => {
  const configured =
    process.env.STOREFRONT_URL ||
    process.env.STORE_PUBLIC_URL ||
    process.env.STORE_CORS?.split(",")[0]

  return (configured || "http://localhost:8000").trim().replace(/\/+$/, "")
}

const getCountryCode = () =>
  (process.env.META_CATALOG_COUNTRY_CODE ||
    process.env.DEFAULT_REGION ||
    "al")
    .trim()
    .toLowerCase()

const getRequestedCurrency = () =>
  (process.env.META_CATALOG_CURRENCY || "eur").trim().toLowerCase()

const metadataValue = (metadata: FeedMetadata, key: string) => {
  const value = metadata[key]

  if (value === undefined || value === null) {
    return ""
  }

  return Array.isArray(value) ? value.join(", ") : String(value)
}

const selectPrice = (prices: any[], requestedCurrency: string) => {
  return (
    prices.find(
      (price) => price.currency_code?.toLowerCase() === requestedCurrency
    ) ||
    prices.find((price) => price.currency_code?.toLowerCase() === "all") ||
    prices[0]
  )
}

const getAvailability = (variant: any) => {
  if (!variant.manage_inventory || variant.allow_backorder) {
    return "in stock"
  }

  return (variant.inventory_quantity || 0) > 0 ? "in stock" : "out of stock"
}

const renderElement = (name: string, value: unknown) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return ""
  }

  return `<g:${name}>${xmlEscape(value)}</g:${name}>`
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query")
  const storefrontUrl = getStorefrontUrl()
  const countryCode = getCountryCode()
  const requestedCurrency = getRequestedCurrency()
  const products: any[] = []
  const pageSize = 500
  let skip = 0
  let total = 0

  do {
    const { data, metadata } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "subtitle",
        "description",
        "handle",
        "thumbnail",
        "images.url",
        "metadata",
        "collection.title",
        "categories.name",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.manage_inventory",
        "variants.allow_backorder",
        "variants.inventory_quantity",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      filters: {
        status: "published",
      },
      pagination: {
        take: pageSize,
        skip,
        order: {
          title: "ASC",
        },
      },
    })

    products.push(...data)
    total = metadata?.count ?? data.length
    skip += data.length
  } while (skip < total)

  const items = products.flatMap((product: any) => {
    const metadata = (product.metadata || {}) as FeedMetadata
    const categoryNames = (product.categories || [])
      .map((category: any) => category.name)
      .filter(Boolean)
    const productType = [
      product.collection?.title,
      ...categoryNames,
    ]
      .filter(Boolean)
      .join(" > ")
    const link = `${storefrontUrl}/${countryCode}/products/${encodeURIComponent(
      product.handle
    )}`
    const imageUrl = product.thumbnail || product.images?.[0]?.url

    return (product.variants || []).flatMap((variant: any) => {
      const price = selectPrice(variant.prices || [], requestedCurrency)

      if (!price || typeof price.amount !== "number" || !imageUrl) {
        return []
      }

      const currency =
        price.currency_code?.toLowerCase() === "all"
          ? requestedCurrency
          : price.currency_code?.toLowerCase()
      const title =
        product.variants.length > 1 && variant.title
          ? `${product.title} - ${variant.title}`
          : product.title

      return [
        [
          "<item>",
          renderElement("id", variant.id),
          renderElement("item_group_id", product.id),
          renderElement("title", title),
          renderElement(
            "description",
            product.description || product.subtitle || product.title
          ),
          renderElement("availability", getAvailability(variant)),
          renderElement("condition", "new"),
          renderElement("price", `${price.amount} ${currency.toUpperCase()}`),
          renderElement("link", link),
          renderElement("image_link", imageUrl),
          renderElement("brand", metadataValue(metadata, "brand") || "YCO"),
          renderElement("mpn", variant.sku),
          renderElement("identifier_exists", variant.sku ? "yes" : "no"),
          renderElement("product_type", productType),
          ...[0, 1, 2, 3, 4].map((index) =>
            renderElement(
              `custom_label_${index}`,
              metadataValue(metadata, `meta_custom_label_${index}`)
            )
          ),
          "</item>",
        ].join(""),
      ]
    })
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">',
    "<channel>",
    "<title>YCO Meta Product Catalog</title>",
    `<link>${xmlEscape(storefrontUrl)}</link>`,
    "<description>Published products available for Meta Commerce Manager</description>",
    ...items,
    "</channel>",
    "</rss>",
  ].join("\n")

  res.setHeader("Content-Type", "application/xml; charset=utf-8")
  res.setHeader("Cache-Control", "public, max-age=300")
  res.status(200).send(xml)
}
