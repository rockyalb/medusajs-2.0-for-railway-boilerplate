import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  updateInventoryLevelsWorkflow,
  updateCollectionsWorkflow,
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import fs from "fs/promises"
import path from "path"
import sharp from "sharp"

type WooCategory = {
  id: number
  name: string
  slug: string
  parent: number
  description?: string
  count?: number
}

type WooTag = {
  id: number
  name: string
  slug: string
}

type WooImage = {
  id: number
  src: string
  name?: string
  alt?: string
}

type WooAttribute = {
  id?: number
  name: string
  option?: string
  options?: string[]
}

type WooDimensions = {
  length?: string
  width?: string
  height?: string
}

type WooProduct = {
  id: number
  name: string
  slug: string
  permalink: string
  type: string
  status: string
  description?: string
  short_description?: string
  sku?: string
  price?: string
  regular_price?: string
  sale_price?: string
  manage_stock?: boolean
  stock_quantity?: number | null
  backorders?: string
  weight?: string
  dimensions?: WooDimensions
  categories?: WooCategory[]
  tags?: WooTag[]
  images?: WooImage[]
  attributes?: WooAttribute[]
}

type WooVariation = {
  id: number
  name?: string
  sku?: string
  price?: string
  regular_price?: string
  sale_price?: string
  manage_stock?: boolean
  stock_quantity?: number | null
  backorders?: string
  weight?: string
  dimensions?: WooDimensions
  image?: WooImage | null
  attributes?: WooAttribute[]
}

type UploadedImageCache = Record<
  string,
  {
    source_url: string
    uploaded_url: string
    file_key?: string
  }
>

type CliOptions = {
  dryRun: boolean
  skipImages: boolean
  limit?: number
}

const CURRENCY_CODE = "all"
const FORMAT_OPTION = "Format"
const DEFAULT_FORMAT = "Default"
const STOCK_LOCATION_NAME = "Albania Warehouse"
const CACHE_DIR = path.join(process.cwd(), ".medusa", "import-cache")
const IMAGE_CACHE_FILE = path.join(CACHE_DIR, "woocommerce-image-cache.json")
const KNOWN_BRAND_SLUGS = new Set([
  "davines",
  "comfort-zone",
  "comfortzone",
  "bambaw",
  "kindbag",
  "kind-bag",
  "here-we-flo",
  "here-we-flo",
  "upcircle",
])
const KNOWN_BRAND_NAMES = new Set([
  "davines",
  "comfort zone",
  "comfortzone",
  "bambaw",
  "kindbag",
  "kind bag",
  "here we flo",
  "upcircle",
])

function parseCliOptions(args: string[]): CliOptions {
  const limitArg = args.find((arg) => arg.startsWith("--limit="))
  const limitEnv = process.env.WC_IMPORT_LIMIT
  const limit = limitArg
    ? Number(limitArg.replace("--limit=", ""))
    : limitEnv
      ? Number(limitEnv)
      : undefined

  return {
    dryRun: args.includes("--dry-run") || process.env.WC_IMPORT_DRY_RUN === "1",
    skipImages:
      args.includes("--skip-images") ||
      process.env.WC_IMPORT_SKIP_IMAGES === "1" ||
      process.env.WC_IMPORT_DATA_ONLY === "1",
    limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined,
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function stripHtml(value?: string): string {
  return String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parseNumber(value?: string | number | null): number | null {
  if (value === undefined || value === null || value === "") {
    return null
  }

  const parsed = Number(String(value).replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}

function parsePrice(...values: Array<string | undefined>): number {
  for (const value of values) {
    const parsed = parseNumber(value)

    if (parsed !== null) {
      return parsed
    }
  }

  return 0
}

function shouldManageWooInventory(item: Pick<WooProduct | WooVariation, "manage_stock" | "stock_quantity">): boolean {
  return item.manage_stock === true || item.stock_quantity !== undefined && item.stock_quantity !== null
}

function getWooStockQuantity(item: Pick<WooProduct | WooVariation, "stock_quantity">): number {
  return Math.max(0, Math.trunc(item.stock_quantity ?? 0))
}

function isBrandCategory(category: Pick<WooCategory, "name" | "slug">): boolean {
  return (
    KNOWN_BRAND_SLUGS.has(category.slug.toLowerCase()) ||
    KNOWN_BRAND_NAMES.has(category.name.toLowerCase())
  )
}

function getBrandCategory(product: WooProduct): WooCategory | undefined {
  return (product.categories || []).find(isBrandCategory)
}

function getFormatFromVariation(
  variation: WooVariation,
  fallbackIndex: number
): string {
  const attribute = (variation.attributes || []).find((attr) => attr.option)

  if (attribute?.option) {
    return attribute.option
  }

  if (variation.name) {
    const parts = variation.name.split("-")
    const value = parts[parts.length - 1]?.trim()

    if (value) {
      return value
    }
  }

  return `Variant ${fallbackIndex + 1}`
}

function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function getProductImages(product: WooProduct, variations: WooVariation[]): WooImage[] {
  const images = [...(product.images || [])]

  for (const variation of variations) {
    if (variation.image?.src) {
      images.push(variation.image)
    }
  }

  const seen = new Set<string>()
  return images.filter((image) => {
    const key = String(image.id || image.src)

    if (!image.src || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

async function readImageCache(): Promise<UploadedImageCache> {
  try {
    const raw = await fs.readFile(IMAGE_CACHE_FILE, "utf8")
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeImageCache(cache: UploadedImageCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true })
  await fs.writeFile(IMAGE_CACHE_FILE, JSON.stringify(cache, null, 2))
}

class WooClient {
  private readonly baseUrl: string
  private readonly consumerKey: string
  private readonly consumerSecret: string

  constructor() {
    this.baseUrl = requireEnv("WC_URL").replace(/\/$/, "")
    this.consumerKey = requireEnv("WC_CONSUMER_KEY")
    this.consumerSecret = requireEnv("WC_CONSUMER_SECRET")
  }

  private async get<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<{ data: T; headers: Headers }> {
    const url = new URL(`${this.baseUrl}/wp-json/wc/v3/${endpoint}`)
    url.searchParams.set("consumer_key", this.consumerKey)
    url.searchParams.set("consumer_secret", this.consumerSecret)

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value))
    }

    const response = await fetch(url)

    if (!response.ok) {
      const body = await response.text()
      throw new Error(
        `WooCommerce ${endpoint} request failed (${response.status}): ${body}`
      )
    }

    return {
      data: (await response.json()) as T,
      headers: response.headers,
    }
  }

  async listAll<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<T[]> {
    const all: T[] = []
    let page = 1
    let totalPages = 1

    do {
      const { data, headers } = await this.get<T[]>(endpoint, {
        per_page: 100,
        page,
        ...params,
      })

      all.push(...data)
      totalPages = Number(headers.get("x-wp-totalpages") || 1)
      page += 1
    } while (page <= totalPages)

    return all
  }

  async listProducts(): Promise<WooProduct[]> {
    return this.listAll<WooProduct>("products", {
      status: "any",
      orderby: "id",
      order: "asc",
    })
  }

  async listCategories(): Promise<WooCategory[]> {
    return this.listAll<WooCategory>("products/categories", {
      hide_empty: "false",
      orderby: "id",
      order: "asc",
    })
  }

  async listTags(): Promise<WooTag[]> {
    return this.listAll<WooTag>("products/tags", {
      hide_empty: "false",
      orderby: "id",
      order: "asc",
    })
  }

  async listVariations(productId: number): Promise<WooVariation[]> {
    return this.listAll<WooVariation>(`products/${productId}/variations`, {
      status: "any",
      orderby: "id",
      order: "asc",
    })
  }
}

async function uploadWooImages(
  container: ExecArgs["container"],
  images: WooImage[],
  cache: UploadedImageCache
): Promise<string[]> {
  const urls: string[] = []

  for (const image of images) {
    const cacheKey = String(image.id || image.src)
    const cached = cache[cacheKey]

    if (cached?.uploaded_url) {
      urls.push(cached.uploaded_url)
      continue
    }

    const response = await fetch(image.src)

    if (!response.ok) {
      throw new Error(`Image download failed (${response.status}): ${image.src}`)
    }

    const original = Buffer.from(await response.arrayBuffer())
    const webp = await sharp(original).webp({ quality: 86 }).toBuffer()
    const filename = `${cacheKey}-${slugify(image.name || image.alt || "product")}.webp`
    const { result } = await uploadFilesWorkflow(container).run({
      input: {
        files: [
          {
            filename,
            mimeType: "image/webp",
            content: webp.toString("base64"),
            access: "public",
          },
        ],
      },
    })

    const uploaded = result[0]

    cache[cacheKey] = {
      source_url: image.src,
      uploaded_url: uploaded.url,
      file_key: uploaded.id,
    }
    urls.push(uploaded.url)
    await writeImageCache(cache)
  }

  return uniq(urls)
}

async function upsertCollections(
  container: ExecArgs["container"],
  brands: WooCategory[],
  dryRun: boolean
): Promise<Map<number, string>> {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const brandMap = new Map<number, string>()

  for (const brand of brands) {
    const existing = await productModuleService.listProductCollections({
      handle: brand.slug,
    })

    if (dryRun) {
      brandMap.set(brand.id, existing[0]?.id || `dry-run-collection-${brand.id}`)
      continue
    }

    if (existing[0]) {
      const { result } = await updateCollectionsWorkflow(container).run({
        input: {
          selector: { id: existing[0].id },
          update: {
            title: brand.name,
            handle: brand.slug,
            metadata: {
              ...(existing[0].metadata || {}),
              woocommerce_category_id: brand.id,
              woocommerce_slug: brand.slug,
              imported_from: "woocommerce",
            },
          },
        },
      })

      brandMap.set(brand.id, result[0].id)
      continue
    }

    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: [
          {
            title: brand.name,
            handle: brand.slug,
            metadata: {
              woocommerce_category_id: brand.id,
              woocommerce_slug: brand.slug,
              imported_from: "woocommerce",
            },
          },
        ],
      },
    })

    brandMap.set(brand.id, result[0].id)
  }

  return brandMap
}

async function upsertCategories(
  container: ExecArgs["container"],
  categories: WooCategory[],
  dryRun: boolean
): Promise<Map<number, string>> {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const categoryMap = new Map<number, string>()
  const importable = categories
    .filter((category) => !isBrandCategory(category))
    .sort((a, b) => (a.parent || 0) - (b.parent || 0))

  for (const category of importable) {
    const parentCategoryId = category.parent
      ? categoryMap.get(category.parent) || null
      : null
    const existing = await productModuleService.listProductCategories({
      handle: category.slug,
    })

    if (dryRun) {
      categoryMap.set(category.id, existing[0]?.id || `dry-run-category-${category.id}`)
      continue
    }

    if (existing[0]) {
      const { result } = await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: existing[0].id },
          update: {
            name: category.name,
            handle: category.slug,
            description: stripHtml(category.description),
            is_active: true,
            is_internal: false,
            parent_category_id: parentCategoryId,
            metadata: {
              ...(existing[0].metadata || {}),
              woocommerce_category_id: category.id,
              woocommerce_slug: category.slug,
              imported_from: "woocommerce",
            },
          },
        },
      })

      categoryMap.set(category.id, result[0].id)
      continue
    }

    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: category.name,
            handle: category.slug,
            description: stripHtml(category.description),
            is_active: true,
            is_internal: false,
            parent_category_id: parentCategoryId,
            metadata: {
              woocommerce_category_id: category.id,
              woocommerce_slug: category.slug,
              imported_from: "woocommerce",
            },
          },
        ],
      },
    })

    categoryMap.set(category.id, result[0].id)
  }

  return categoryMap
}

async function findExistingProduct(
  container: ExecArgs["container"],
  product: WooProduct
) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const byExternal = await productModuleService.listProducts(
    { external_id: `woocommerce:${product.id}` },
    {
      relations: ["variants"],
      select: ["id", "handle", "metadata", "variants.id", "variants.sku", "variants.metadata"],
      take: 1,
    }
  )

  if (byExternal[0]) {
    return byExternal[0]
  }

  const byHandle = await productModuleService.listProducts(
    { handle: product.slug },
    {
      relations: ["variants"],
      select: ["id", "handle", "metadata", "variants.id", "variants.sku", "variants.metadata"],
      take: 1,
    }
  )

  return byHandle[0]
}

function buildVariantPayloads(
  product: WooProduct,
  variations: WooVariation[],
  existingProduct?: any
) {
  if (product.type === "variable") {
    return variations.map((variation, index) => {
      const format = getFormatFromVariation(variation, index)
      const existingVariant = (existingProduct?.variants || []).find((variant: any) => {
        return (
          variant.metadata?.woocommerce_variation_id === variation.id ||
          (variation.sku && variant.sku === variation.sku)
        )
      })

      return {
        ...(existingVariant?.id ? { id: existingVariant.id } : {}),
        title: format,
        sku: variation.sku || null,
        manage_inventory: shouldManageWooInventory(variation),
        allow_backorder: variation.backorders === "yes" || variation.backorders === "notify",
        weight: parseNumber(variation.weight),
        length: parseNumber(variation.dimensions?.length),
        width: parseNumber(variation.dimensions?.width),
        height: parseNumber(variation.dimensions?.height),
        options: { [FORMAT_OPTION]: format },
        prices: [
          {
            amount: parsePrice(
              variation.sale_price,
              variation.regular_price,
              variation.price
            ),
            currency_code: CURRENCY_CODE,
          },
        ],
        metadata: {
          ...(existingVariant?.metadata || {}),
          woocommerce_variation_id: variation.id,
          woocommerce_parent_id: product.id,
          woocommerce_stock_quantity: variation.stock_quantity,
          woocommerce_manage_stock: variation.manage_stock,
          imported_from: "woocommerce",
        },
      }
    })
  }

  const existingVariant = (existingProduct?.variants || [])[0]

  return [
    {
      ...(existingVariant?.id ? { id: existingVariant.id } : {}),
      title: DEFAULT_FORMAT,
      sku: product.sku || null,
      manage_inventory: shouldManageWooInventory(product),
      allow_backorder: product.backorders === "yes" || product.backorders === "notify",
      weight: parseNumber(product.weight),
      length: parseNumber(product.dimensions?.length),
      width: parseNumber(product.dimensions?.width),
      height: parseNumber(product.dimensions?.height),
      options: { [FORMAT_OPTION]: DEFAULT_FORMAT },
      prices: [
        {
          amount: parsePrice(product.sale_price, product.regular_price, product.price),
          currency_code: CURRENCY_CODE,
        },
      ],
      metadata: {
        ...(existingVariant?.metadata || {}),
        woocommerce_variation_id: null,
        woocommerce_product_id: product.id,
        woocommerce_stock_quantity: product.stock_quantity,
        woocommerce_manage_stock: product.manage_stock,
        imported_from: "woocommerce",
      },
    },
  ]
}

async function getDefaultStockLocationId(
  container: ExecArgs["container"]
): Promise<string> {
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
  const [namedLocation] = await stockLocationModuleService.listStockLocations({
    name: STOCK_LOCATION_NAME,
  })

  if (namedLocation) {
    return namedLocation.id
  }

  const [firstLocation] = await stockLocationModuleService.listStockLocations(
    {},
    {
      select: ["id"],
      take: 1,
    }
  )

  if (!firstLocation) {
    throw new Error(
      `No stock location found. Run setup-all-shipping.ts before importing inventory.`
    )
  }

  return firstLocation.id
}

function getWooVariantStockQuantity(variant: any): number | null {
  const metadata = variant.metadata || {}
  const rawQuantity = metadata.woocommerce_stock_quantity
  const managesStock = metadata.woocommerce_manage_stock === true

  if (rawQuantity === undefined || rawQuantity === null) {
    return managesStock ? 0 : null
  }

  const parsed = Number(rawQuantity)
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : null
}

async function syncProductInventoryLevels(
  container: ExecArgs["container"],
  productId: string,
  locationId: string
) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const inventoryModuleService = container.resolve(Modules.INVENTORY)
  const [product] = await productModuleService.listProducts(
    { id: productId },
    {
      relations: ["variants"],
      select: [
        "id",
        "variants.id",
        "variants.manage_inventory",
        "variants.metadata",
      ],
      take: 1,
    }
  )

  if (!product?.variants?.length) {
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: links } = await query.graph({
    entity: "product_variant_inventory_item",
    filters: {
      variant_id: product.variants.map((variant: any) => variant.id),
    },
    fields: ["variant_id", "inventory_item_id"],
  })
  const inventoryItemIdByVariantId = new Map(
    links.map((link: any) => [link.variant_id, link.inventory_item_id])
  )
  const inventoryItemIds = [...inventoryItemIdByVariantId.values()]

  if (!inventoryItemIds.length) {
    return
  }

  const existingLevels = await inventoryModuleService.listInventoryLevels(
    {
      inventory_item_id: inventoryItemIds,
      location_id: locationId,
    },
    {
      select: ["id", "inventory_item_id"],
      take: inventoryItemIds.length,
    }
  )
  const existingLevelItemIds = new Set(
    existingLevels.map((level) => level.inventory_item_id)
  )
  const levelsToCreate = []
  const levelsToUpdate = []

  for (const variant of product.variants) {
    const stockedQuantity = getWooVariantStockQuantity(variant)
    const inventoryItemId = inventoryItemIdByVariantId.get(variant.id)

    if (stockedQuantity === null || !inventoryItemId) {
      continue
    }

    const level = {
      inventory_item_id: inventoryItemId,
      location_id: locationId,
      stocked_quantity: stockedQuantity,
    }

    if (existingLevelItemIds.has(inventoryItemId)) {
      levelsToUpdate.push(level)
    } else {
      levelsToCreate.push(level)
    }
  }

  if (levelsToCreate.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: levelsToCreate,
      },
    })
  }

  if (levelsToUpdate.length) {
    await updateInventoryLevelsWorkflow(container).run({
      input: {
        updates: levelsToUpdate,
      },
    })
  }
}

async function upsertProduct(
  container: ExecArgs["container"],
  product: WooProduct,
  variations: WooVariation[],
  categoryMap: Map<number, string>,
  brandMap: Map<number, string>,
  imageUrls: string[],
  dryRun: boolean,
  includeImages: boolean
) {
  const existingProduct = await findExistingProduct(container, product)
  const brand = getBrandCategory(product)
  const collectionId = brand ? brandMap.get(brand.id) || null : null
  const categoryIds = (product.categories || [])
    .filter((category) => !isBrandCategory(category))
    .map((category) => categoryMap.get(category.id))
    .filter(Boolean) as string[]
  const variants = buildVariantPayloads(product, variations, existingProduct)
  const formatValues = uniq(
    variants.map((variant) => variant.options[FORMAT_OPTION] || DEFAULT_FORMAT)
  )
  const metadata = {
    ...(existingProduct?.metadata || {}),
    woocommerce_id: product.id,
    woocommerce_slug: product.slug,
    woocommerce_permalink: product.permalink,
    woocommerce_type: product.type,
    woocommerce_category_ids: (product.categories || []).map((category) => category.id),
    woocommerce_image_ids: (product.images || []).map((image) => image.id),
    imported_from: "woocommerce",
  }
  const payload = {
    title: product.name,
    subtitle: stripHtml(product.short_description) || null,
    description: product.description || product.short_description || "",
    handle: product.slug,
    status:
      product.status === "publish" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
    external_id: `woocommerce:${product.id}`,
    collection_id: collectionId,
    category_ids: categoryIds,
    options: [{ title: FORMAT_OPTION, values: formatValues }],
    variants,
    weight: parseNumber(product.weight),
    length: parseNumber(product.dimensions?.length),
    width: parseNumber(product.dimensions?.width),
    height: parseNumber(product.dimensions?.height),
    metadata,
  }
  const payloadWithMedia = includeImages
    ? {
        ...payload,
        thumbnail: imageUrls[0] || null,
        images: imageUrls.map((url) => ({ url })),
      }
    : payload

  if (dryRun) {
    return {
      action: existingProduct ? "update" : "create",
      variants: variants.length,
      images: imageUrls.length,
    }
  }

  if (existingProduct) {
    await updateProductsWorkflow(container).run({
      input: {
        products: [
          {
            id: existingProduct.id,
            ...payloadWithMedia,
          },
        ],
      },
    })

    return {
      action: "update",
      variants: variants.length,
      images: imageUrls.length,
    }
  }

  await createProductsWorkflow(container).run({
    input: {
      products: [payloadWithMedia],
    },
  })

  return {
    action: "create",
    variants: variants.length,
    images: imageUrls.length,
  }
}

export default async function importWooCommerceCatalog({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const options = parseCliOptions(args || [])
  const woo = new WooClient()

  logger.info(
    `Starting WooCommerce import${options.dryRun ? " dry-run" : ""}${
      options.skipImages ? " without image uploads" : ""
    }...`
  )

  const [liveProducts, categories, tags] = await Promise.all([
    woo.listProducts(),
    woo.listCategories(),
    woo.listTags(),
  ])
  const products = options.limit
    ? liveProducts.slice(0, options.limit)
    : liveProducts
  const variableProducts = products.filter((product) => product.type === "variable")
  const variationEntries = await Promise.all(
    variableProducts.map(async (product) => ({
      productId: product.id,
      variations: await woo.listVariations(product.id),
    }))
  )
  const variationsByProductId = new Map(
    variationEntries.map((entry) => [entry.productId, entry.variations])
  )
  const totalVariations = variationEntries.reduce(
    (sum, entry) => sum + entry.variations.length,
    0
  )
  const brandCategories = categories.filter(isBrandCategory)
  const regularCategories = categories.filter((category) => !isBrandCategory(category))
  const imageCount = products.reduce((sum, product) => {
    return sum + getProductImages(product, variationsByProductId.get(product.id) || []).length
  }, 0)

  logger.info(`Live WooCommerce products: ${liveProducts.length}`)
  logger.info(`Import batch products: ${products.length}`)
  logger.info(`Simple products: ${products.filter((p) => p.type !== "variable").length}`)
  logger.info(`Variable products: ${variableProducts.length}`)
  logger.info(`Total live variations in batch: ${totalVariations}`)
  logger.info(`Categories: ${regularCategories.length}`)
  logger.info(`Brand collections: ${brandCategories.length}`)
  logger.info(`Tags fetched: ${tags.length}`)
  logger.info(`Images queued: ${imageCount}`)

  const brandMap = await upsertCollections(container, brandCategories, options.dryRun)
  const categoryMap = await upsertCategories(container, categories, options.dryRun)

  if (options.dryRun) {
    logger.info("Dry-run complete. No products or images were changed.")
    return
  }

  const imageCache = await readImageCache()
  const locationId = await getDefaultStockLocationId(container)
  let created = 0
  let updated = 0
  let failed = 0

  for (const product of products) {
    try {
      const variations = variationsByProductId.get(product.id) || []
      const productImages = getProductImages(product, variations)
      const uploadedUrls = options.skipImages
        ? []
        : await uploadWooImages(container, productImages, imageCache)
      const result = await upsertProduct(
        container,
        product,
        variations,
        categoryMap,
        brandMap,
        uploadedUrls,
        false,
        !options.skipImages
      )
      const importedProduct = await findExistingProduct(container, product)

      if (importedProduct?.id) {
        await syncProductInventoryLevels(container, importedProduct.id, locationId)
      }

      if (result.action === "create") {
        created += 1
      } else {
        updated += 1
      }

      logger.info(
        `${result.action.toUpperCase()} ${product.id} ${product.name} (${result.variants} variant(s), ${result.images} image(s))`
      )
    } catch (error) {
      failed += 1
      logger.error(
        `FAILED ${product.id} ${product.name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  await writeImageCache(imageCache)
  logger.info(
    `WooCommerce import complete. Created: ${created}, Updated: ${updated}, Failed: ${failed}.`
  )
}
