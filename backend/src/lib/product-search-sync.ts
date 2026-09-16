import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type ProductSearchDocument = {
  id: string
  title: string | null
  description: string | null
  handle: string | null
  variant_sku: string
  thumbnail: string | null
}

type ProductGraphResult = {
  id: string
  title?: string | null
  description?: string | null
  handle?: string | null
  thumbnail?: string | null
  variants?: Array<{ sku?: string | null }>
}

const getMeiliConfig = () => {
  const host = process.env.MEILISEARCH_HOST?.trim().replace(/\/+$/, "")
  const apiKey = (
    process.env.MEILISEARCH_ADMIN_KEY ||
    process.env.MEILISEARCH_MASTER_KEY
  )?.trim()
  const indexName = process.env.MEILISEARCH_PRODUCTS_INDEX || "products"

  return { host, apiKey, indexName }
}

const getStorefrontUrl = () => {
  const configured = process.env.STOREFRONT_URL?.trim()

  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("STOREFRONT_URL is required to refresh the storefront cache")
  }

  return (configured || "http://localhost:8000").trim().replace(/\/+$/, "")
}

const toProductSearchDocument = (
  product: ProductGraphResult
): ProductSearchDocument => ({
  id: product.id,
  title: product.title || null,
  description: product.description || null,
  handle: product.handle || null,
  variant_sku: (product.variants || [])
    .map((variant) => variant.sku)
    .filter(Boolean)
    .join(" "),
  thumbnail: product.thumbnail || null,
})

export const retrieveProductSearchDocument = async (
  container: any,
  productId: string
): Promise<ProductSearchDocument | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    filters: { id: productId },
    fields: [
      "id",
      "title",
      "description",
      "handle",
      "thumbnail",
      "variants.sku",
    ],
    pagination: {
      take: 1,
    },
  })
  const product = data[0] as ProductGraphResult | undefined

  return product ? toProductSearchDocument(product) : null
}

export const upsertProductInMeili = async (
  document: ProductSearchDocument
): Promise<boolean> => {
  const { host, apiKey, indexName } = getMeiliConfig()

  if (!host || !apiKey) {
    return false
  }

  const response = await fetch(
    `${host}/indexes/${indexName}/documents?primaryKey=id`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify([document]),
    }
  )

  if (!response.ok) {
    throw new Error(
      `Meili product upsert failed: ${response.status} ${await response.text()}`
    )
  }

  return true
}

export const deleteProductFromMeili = async (
  productId: string
): Promise<boolean> => {
  const { host, apiKey, indexName } = getMeiliConfig()

  if (!host || !apiKey) {
    return false
  }

  const response = await fetch(
    `${host}/indexes/${indexName}/documents/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )

  if (!response.ok && response.status !== 404) {
    throw new Error(
      `Meili product delete failed: ${response.status} ${await response.text()}`
    )
  }

  return true
}

export const expireStorefrontProductCache = async (
  handle?: string | null
): Promise<boolean> => {
  // Next renders public URLs under /[countryCode]. Expire the actual route
  // pattern too, including cached 404s and old handles after rename/deletion.
  const paths = ["/[countryCode]/products/[handle]"]
  if (handle) {
    paths.push(`/products/${handle}`, `/al/products/${handle}`)
  }

  try {
    const url = `${getStorefrontUrl()}/api/revalidate`
    const response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "Content-Type": "application/json",
        ...(process.env.REVALIDATE_SECRET
          ? { "x-revalidate-secret": process.env.REVALIDATE_SECRET }
          : {}),
      },
      body: JSON.stringify({
        tags: ["products", "categories", "collections"],
        paths,
      }),
    })

    if (!response.ok) {
      console.error(
        `Storefront product revalidation failed: ${response.status} ${response.statusText}`
      )
    }

    if (!response.ok) return false

    const result = await response.json()
    return result.revalidated === true
  } catch (error) {
    console.error("Storefront product revalidation request failed", error)
    return false
  }
}

export const syncProductSearchAndCache = async (
  container: any,
  productId: string
) => {
  // Search failures must never prevent the next storefront read being fresh.
  const cacheExpired = await expireStorefrontProductCache()
  const document = await retrieveProductSearchDocument(container, productId)

  if (!document) {
    await deleteProductFromMeili(productId)
    return { indexed: false, deleted: true, cacheExpired }
  }

  const indexed = await upsertProductInMeili(document)
  return { indexed, deleted: false, cacheExpired }
}
