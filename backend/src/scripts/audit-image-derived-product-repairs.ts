import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import fs from "fs/promises"
import path from "path"

type CorruptedProduct = {
  woo_id: number
  modified_at: string
  current_name: string
  current_slug: string
  image_ids: number[]
  image_names: string[]
}

type ShopifyImageMap = {
  wc_media_id: number
  wc_media_url: string
  shopify_product_id: number
  shopify_image_id: number
  position: number
  filename: string
}

type ShopifyImageManifest = {
  shopify_product_id: number
  shopify_product_title: string
  shopify_image_id: number
  position: number
  url: string
  filename: string
  local_path: string
}

type ShopifyProduct = {
  id: number
  title: string
  handle: string
  body_html?: string
  tags?: string[]
  variants?: Array<{
    title?: string
    option1?: string
    price?: string
    available?: boolean
  }>
  images?: Array<{
    id: number
    src: string
  }>
}

type MedusaProduct = {
  id: string
  title?: string | null
  handle?: string | null
  status?: ProductStatus
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
  images?: Array<{ id: string; url: string }>
  variants?: Array<{ id: string; title?: string | null; sku?: string | null }>
}

const PRODUCTS_YCO_DATA_DIR = path.resolve(
  process.cwd(),
  "..",
  "..",
  "..",
  "products-yco",
  "data"
)

const CORRUPTED_PRODUCTS: CorruptedProduct[] = [
  {
    woo_id: 990027,
    modified_at: "2026-02-24T23:30:40",
    current_name: "Davines / Minu Shampoo",
    current_slug: "davines-minu-shampoo",
    image_ids: [990352],
    image_names: ["CALMING Superactive"],
  },
  {
    woo_id: 989580,
    modified_at: "2026-02-24T23:30:54",
    current_name: "DAVINES/ SOLU Shampoo",
    current_slug: "davines-solu-shampo-per-floke-me-yndyre",
    image_ids: [990267, 990268],
    image_names: ["WELL-BEING Shampoo"],
  },
  {
    woo_id: 989572,
    modified_at: "2026-02-24T23:30:56",
    current_name: "DAVINES MELU/ Kondicioner per floke te demtuar",
    current_slug: "davines-melu-kondicioner-per-floke-te-demtuar",
    image_ids: [990248, 990249],
    image_names: ["RENEWING Shampoo"],
  },
  {
    woo_id: 989563,
    modified_at: "2026-02-24T23:30:57",
    current_name: "DAVINES/ SOLU Scrub per floket me kripe deti",
    current_slug: "davines-solu-scrub-per-floket-me-kripe-deti",
    image_ids: [990351],
    image_names: ["NOURISHING Hair Royal Jelly Superactive"],
  },
  {
    woo_id: 989542,
    modified_at: "2026-02-24T23:31:01",
    current_name: "DAVINES/ Energizing Xhel trajtues per floke te holle",
    current_slug: "davinez-energizing-xhel-trajtues-per-floke-te-holle",
    image_ids: [990310],
    image_names: ["This is an Extra Strong Hair Spray"],
  },
  {
    woo_id: 989536,
    modified_at: "2026-02-24T23:31:03",
    current_name: "DAVINES/ Energizing Serum Sezonal per renien e flokeve",
    current_slug: "davines-energizing-serum-sezonal-per-renien-e-flokeve",
    image_ids: [990344],
    image_names: ["This is a Medium Hold Finishing Gum"],
  },
  {
    woo_id: 989046,
    modified_at: "2026-02-24T23:31:18",
    current_name: "Davines SU/ Qumesht per floket 135 ml",
    current_slug: "davines-su-qumesht-per-floket-135-ml",
    image_ids: [990263, 990264],
    image_names: ["WELL-BEING Conditioner"],
  },
  {
    woo_id: 989050,
    modified_at: "2026-02-24T23:31:18",
    current_name: "Davines SU/ Mask per floket 150 ml",
    current_slug: "davines-su-mask-per-floket-150-ml",
    image_ids: [990353],
    image_names: ["ENERGIZING Gel"],
  },
  {
    woo_id: 989060,
    modified_at: "2026-02-24T23:31:18",
    current_name: "Davines SU/ AfterSun Gel",
    current_slug: "davines-su-aftersun-gel",
    image_ids: [990278, 990279],
    image_names: ["CALMING Shampoo"],
  },
  {
    woo_id: 988823,
    modified_at: "2026-02-24T23:31:21",
    current_name: "DAVINES/ LOVE per rritjen e kacurrelave",
    current_slug: "krem-love-per-rritjen-e-kacurrelave",
    image_ids: [990306],
    image_names: ["This is a Texturizing Serum"],
  },
  {
    woo_id: 988751,
    modified_at: "2026-02-24T23:31:25",
    current_name: "Vaj ushqyes autentik Davines",
    current_slug: "vaj-ushqyes-autentik-davines",
    image_ids: [990314],
    image_names: ["This is a Dry Texturizer"],
  },
  {
    woo_id: 988757,
    modified_at: "2026-02-24T23:31:25",
    current_name: "Nektar Autentik Davines pastrues per floket & trupin",
    current_slug: "nektar-autentik-davines-pastrues-per-floket-trupin",
    image_ids: [990307],
    image_names: ["This is a Shimmering Mist"],
  },
  {
    woo_id: 988754,
    modified_at: "2026-02-24T18:40:24",
    current_name: "AUTHENTIC / Balsam organik hidratues per floket & lekuren",
    current_slug: "balsam-autentik-hidratues-me-vaj-organik-per-floket-dhe-lekuren",
    image_ids: [990293],
    image_names: ["PURIFYING Gel"],
  },
]

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

async function readJson<T>(filename: string): Promise<T> {
  const raw = await fs.readFile(path.join(PRODUCTS_YCO_DATA_DIR, filename), "utf8")
  return JSON.parse(raw) as T
}

function indexBy<T, K extends string | number>(
  values: T[],
  keyFn: (value: T) => K | undefined
): Map<K, T> {
  const map = new Map<K, T>()

  for (const value of values) {
    const key = keyFn(value)

    if (key !== undefined) {
      map.set(key, value)
    }
  }

  return map
}

function findMedusaProduct(
  products: MedusaProduct[],
  source?: ShopifyProduct
): MedusaProduct | undefined {
  if (!source) {
    return
  }

  const handle = source.handle || slugify(source.title)
  const normalizedTitle = slugify(source.title)

  return products.find((product) => {
    return (
      product.handle === handle ||
      slugify(product.title || "") === normalizedTitle ||
      product.metadata?.shopify_product_id === source.id ||
      product.metadata?.woocommerce_shopify_product_id === source.id
    )
  })
}

function findCorruptedMedusaProduct(
  products: MedusaProduct[],
  candidate: CorruptedProduct
): MedusaProduct | undefined {
  return products.find((product) => {
    return (
      product.handle === candidate.current_slug ||
      product.metadata?.woocommerce_id === candidate.woo_id ||
      product.metadata?.woocommerce_slug === candidate.current_slug
    )
  })
}

function summarizeSourceFields(source?: ShopifyProduct) {
  const variants = source?.variants || []
  const images = source?.images || []

  return {
    has_title: Boolean(source?.title),
    has_handle: Boolean(source?.handle),
    has_description: Boolean(stripHtml(source?.body_html)),
    has_variants: variants.length > 0,
    has_prices: variants.some((variant) => variant.price),
    has_images: images.length > 0,
    has_ingredients: false,
    has_how_to_use: false,
    description_preview: stripHtml(source?.body_html).slice(0, 180),
    variants: variants.map((variant) => ({
      title: variant.option1 || variant.title,
      source_price: variant.price,
      price_all: variant.price ? Math.round(Number(variant.price) * 100) : null,
      available: variant.available,
    })),
  }
}

async function listAllMedusaProducts(
  productModuleService: any
): Promise<MedusaProduct[]> {
  const products: MedusaProduct[] = []
  let skip = 0
  const take = 100

  while (true) {
    const batch = (await productModuleService.listProducts(
      {},
      {
        relations: ["images", "variants"],
        select: [
          "id",
          "title",
          "handle",
          "status",
          "thumbnail",
          "metadata",
          "images.id",
          "images.url",
          "variants.id",
          "variants.title",
          "variants.sku",
        ],
        skip,
        take,
      }
    )) as MedusaProduct[]

    products.push(...batch)

    if (batch.length < take) {
      break
    }

    skip += batch.length
  }

  return products
}

function toCsvValue(value: unknown) {
  const text = Array.isArray(value)
    ? value.join("; ")
    : value === undefined || value === null
      ? ""
      : String(value)

  return `"${text.replace(/"/g, '""')}"`
}

export default async function auditImageDerivedProductRepairs({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)

  const [mediaMapObject, manifest, davinesRaw] = await Promise.all([
    readJson<Record<string, ShopifyImageMap>>("image-media-map.json"),
    readJson<ShopifyImageManifest[]>("image-manifest.json"),
    readJson<ShopifyProduct[]>("davines-raw.json"),
  ])
  const mediaMaps = Object.values(mediaMapObject)
  const mediaByWooId = indexBy(mediaMaps, (entry) => entry.wc_media_id)
  const manifestByShopifyImageId = indexBy(
    manifest,
    (entry) => entry.shopify_image_id
  )
  const sourceByShopifyProductId = indexBy(davinesRaw, (entry) => entry.id)
  const medusaProducts = await listAllMedusaProducts(productModuleService)

  const report = CORRUPTED_PRODUCTS.map((candidate) => {
    const mediaMatches = candidate.image_ids
      .map((imageId) => mediaByWooId.get(imageId))
      .filter(Boolean) as ShopifyImageMap[]
    const sourceProductIds = [
      ...new Set(mediaMatches.map((entry) => entry.shopify_product_id)),
    ]
    const sourceProducts = sourceProductIds
      .map((id) => sourceByShopifyProductId.get(id))
      .filter(Boolean) as ShopifyProduct[]
    const primarySource = sourceProducts[0]
    const medusaImageProduct = findMedusaProduct(medusaProducts, primarySource)
    const medusaCorruptedProduct = findCorruptedMedusaProduct(
      medusaProducts,
      candidate
    )
    const manifestImages = mediaMatches
      .map((entry) => manifestByShopifyImageId.get(entry.shopify_image_id))
      .filter(Boolean) as ShopifyImageManifest[]

    return {
      corrupted_woo: candidate,
      image_to_source_mapping: {
        source_product_ids: sourceProductIds,
        source_titles: sourceProducts.map((product) => product.title),
        source_handles: sourceProducts.map((product) => product.handle),
        source_image_files: manifestImages.map((image) => image.filename),
      },
      medusa_state: {
        corrupted_product_found: Boolean(medusaCorruptedProduct),
        corrupted_product: medusaCorruptedProduct
          ? {
              id: medusaCorruptedProduct.id,
              title: medusaCorruptedProduct.title,
              handle: medusaCorruptedProduct.handle,
              status: medusaCorruptedProduct.status,
              image_count: medusaCorruptedProduct.images?.length || 0,
            }
          : null,
        image_real_product_found: Boolean(medusaImageProduct),
        image_real_product: medusaImageProduct
          ? {
              id: medusaImageProduct.id,
              title: medusaImageProduct.title,
              handle: medusaImageProduct.handle,
              status: medusaImageProduct.status,
              image_count: medusaImageProduct.images?.length || 0,
            }
          : null,
      },
      available_source_fields: summarizeSourceFields(primarySource),
      recommended_action: medusaImageProduct
        ? "review_duplicate_or_merge_existing_medusa_product"
        : primarySource
          ? "create_missing_medusa_product_from_local_davines_source"
          : "needs_manual_source_lookup",
      notes: !primarySource
        ? "No Shopify/Davines source product was found from the attached Woo media IDs."
        : "Local source has title, handle, description, variants/prices, and image files. Ingredients/how-to still need official lookup unless already acceptable as blank.",
    }
  })

  const outDir = path.join(PRODUCTS_YCO_DATA_DIR, "repair-audits")
  await fs.mkdir(outDir, { recursive: true })

  const jsonPath = path.join(outDir, "image-derived-product-repair-audit.json")
  const csvPath = path.join(outDir, "image-derived-product-repair-audit.csv")

  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2))

  const csvRows = [
    [
      "corrupted_woo_id",
      "corrupted_handle",
      "corrupted_name",
      "image_names",
      "source_title",
      "source_handle",
      "source_product_id",
      "medusa_corrupted_found",
      "medusa_real_product_found",
      "available_description",
      "available_variants",
      "available_prices",
      "available_ingredients",
      "available_how_to_use",
      "recommended_action",
    ],
    ...report.map((row) => [
      row.corrupted_woo.woo_id,
      row.corrupted_woo.current_slug,
      row.corrupted_woo.current_name,
      row.corrupted_woo.image_names,
      row.image_to_source_mapping.source_titles[0] || "",
      row.image_to_source_mapping.source_handles[0] || "",
      row.image_to_source_mapping.source_product_ids[0] || "",
      row.medusa_state.corrupted_product_found,
      row.medusa_state.image_real_product_found,
      row.available_source_fields.has_description,
      row.available_source_fields.has_variants,
      row.available_source_fields.has_prices,
      row.available_source_fields.has_ingredients,
      row.available_source_fields.has_how_to_use,
      row.recommended_action,
    ]),
  ]

  await fs.writeFile(
    csvPath,
    csvRows.map((row) => row.map(toCsvValue).join(",")).join("\n")
  )

  const missingCount = report.filter(
    (row) => row.recommended_action === "create_missing_medusa_product_from_local_davines_source"
  ).length
  const existingCount = report.filter(
    (row) => row.medusa_state.image_real_product_found
  ).length
  const manualCount = report.filter(
    (row) => row.recommended_action === "needs_manual_source_lookup"
  ).length

  logger.info(`Image-derived product repair audit complete.`)
  logger.info(`Report JSON: ${jsonPath}`)
  logger.info(`Report CSV: ${csvPath}`)
  logger.info(
    `Candidates=${report.length}, missing real products=${missingCount}, existing real products=${existingCount}, manual lookup=${manualCount}.`
  )
}
