import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  getVariantAvailability,
  MedusaError,
  QueryContext,
} from "@medusajs/framework/utils"
import { getCatalogPrice } from "../../../lib/meta-catalog-price"

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
  (process.env.META_CATALOG_COUNTRY_CODE || process.env.DEFAULT_REGION || "al")
    .trim()
    .toLowerCase()

const metadataValue = (metadata: FeedMetadata, key: string) => {
  const value = metadata[key]

  if (value === undefined || value === null) {
    return ""
  }

  return Array.isArray(value) ? value.join(", ") : String(value)
}

const getAvailability = (
  variant: any,
  availability: Record<string, { availability: number | null }>
) => {
  if (!variant.manage_inventory || variant.allow_backorder) {
    return "in stock"
  }

  return (availability[variant.id]?.availability ?? 0) > 0
    ? "in stock"
    : "out of stock"
}

const getSalesChannelId = async (query: any) => {
  const configured = process.env.META_CATALOG_SALES_CHANNEL_ID?.trim()

  if (configured) {
    return configured
  }

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id"],
  })
  const salesChannelId = stores[0]?.default_sales_channel_id

  if (!salesChannelId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No sales channel configured for the Meta catalog"
    )
  }

  return salesChannelId as string
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
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "countries.iso_2"],
  })
  const region = regions.find((candidate: any) =>
    candidate.countries?.some((country: any) => country.iso_2 === countryCode)
  )
  if (!region)
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `No region configured for catalog country ${countryCode}`
    )
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
        "variants.calculated_price.*",
      ],
      filters: {
        status: "published",
      },
      context: {
        variants: {
          calculated_price: QueryContext({
            region_id: region.id,
            currency_code: region.currency_code,
          }),
        },
      },
      pagination: {
        take: pageSize,
        skip,
        order: {
          title: "ASC",
        },
      },
    })

    if (!data.length) break
    products.push(...data)
    total = metadata?.count ?? data.length
    skip += data.length
  } while (skip < total)

  const managedVariantIds = products.flatMap((product: any) =>
    (product.variants || [])
      .filter((variant: any) => variant.manage_inventory)
      .map((variant: any) => variant.id)
  )
  const availability = managedVariantIds.length
    ? await getVariantAvailability(query, {
        variant_ids: managedVariantIds,
        sales_channel_id: await getSalesChannelId(query),
      })
    : {}

  const items = products.flatMap((product: any) => {
    const metadata = (product.metadata || {}) as FeedMetadata
    const categoryNames = (product.categories || [])
      .map((category: any) => category.name)
      .filter(Boolean)
    const productType = [product.collection?.title, ...categoryNames]
      .filter(Boolean)
      .join(" > ")
    const link = `${storefrontUrl}/${countryCode}/products/${encodeURIComponent(
      product.handle
    )}`
    const imageUrl = product.thumbnail || product.images?.[0]?.url
    const additionalImageUrls = Array.from(
      new Set(
        (product.images || [])
          .map((image: any) => image.url)
          .filter((url: unknown) =>
            Boolean(url && typeof url === "string" && url !== imageUrl)
          )
      )
    )

    return (product.variants || []).flatMap((variant: any) => {
      const price = getCatalogPrice(variant.calculated_price)

      if (!price || !imageUrl) {
        return []
      }

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
          renderElement("availability", getAvailability(variant, availability)),
          renderElement("condition", "new"),
          renderElement("price", price.price),
          renderElement("sale_price", price.salePrice),
          renderElement("link", link),
          renderElement("image_link", imageUrl),
          ...additionalImageUrls.map((url) =>
            renderElement("additional_image_link", url)
          ),
          renderElement("brand", metadataValue(metadata, "brand") || "YCO"),
          renderElement("mpn", variant.sku),
          renderElement("identifier_exists", variant.sku ? "yes" : "no"),
          renderElement("product_type", productType),
          ...[0, 1, 2, 3].map((index) =>
            renderElement(
              `custom_label_${index}`,
              metadataValue(metadata, `meta_custom_label_${index}`)
            )
          ),
          renderElement(
            "custom_label_4",
            price.salePrice ? "on_sale" : "regular_price"
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
