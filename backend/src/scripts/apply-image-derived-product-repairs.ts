import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs/promises"
import path from "path"

type AuditRow = {
  corrupted_woo: {
    woo_id: number
    current_slug: string
    current_name: string
    image_ids: number[]
    image_names: string[]
  }
  image_to_source_mapping: {
    source_product_ids: number[]
    source_titles: string[]
    source_handles: string[]
  }
  medusa_state: {
    corrupted_product_found: boolean
    corrupted_product: {
      id: string
      title: string
      handle: string
      status: ProductStatus
      image_count: number
    } | null
    image_real_product_found: boolean
  }
  available_source_fields: {
    description_preview: string
    variants: Array<{
      title?: string
      source_price?: string
      price_all?: number | null
      available?: boolean
    }>
  }
  official_content: {
    url: string
    content: {
      description?: string
      benefits?: string
      ingredients?: string
      how_to_use?: string
    } | null
    how_to_use_al?: string
  }
}

type MedusaProduct = {
  id: string
  title?: string | null
  subtitle?: string | null
  description?: string | null
  handle?: string | null
  status?: ProductStatus
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
  images?: Array<{ id: string; url: string }>
  options?: Array<{ id: string; title: string; values?: Array<{ value: string }> }>
  variants?: Array<{
    id: string
    title?: string | null
    sku?: string | null
    metadata?: Record<string, unknown> | null
    options?: Record<string, string>
  }>
  collection_id?: string | null
  categories?: Array<{ id: string }>
}

const FORMAT_OPTION = "Format"
const DEFAULT_FORMAT = "Default"
const CURRENCY_CODE = "all"
const PRODUCTS_YCO_DATA_DIR = path.resolve(
  process.cwd(),
  "..",
  "..",
  "..",
  "products-yco",
  "data"
)
const ENRICHED_REPORT_PATH = path.join(
  PRODUCTS_YCO_DATA_DIR,
  "repair-audits",
  "image-derived-product-repair-audit.enriched.json"
)

function stripHtml(value?: string): string {
  return String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getDescription(row: AuditRow) {
  return (
    stripHtml(row.official_content.content?.description) ||
    row.available_source_fields.description_preview ||
    ""
  )
}

function buildDetails(row: AuditRow) {
  return stripHtml(row.official_content.content?.benefits)
}

function getVariantTitle(variant: AuditRow["available_source_fields"]["variants"][number]) {
  const title = variant.title?.trim()

  return title && title !== "Default Title" ? title : DEFAULT_FORMAT
}

function buildVariantPayloads(row: AuditRow, existingProduct: MedusaProduct) {
  const existingVariants = existingProduct.variants || []
  const sourceVariants = row.available_source_fields.variants.length
    ? row.available_source_fields.variants
    : [{ title: DEFAULT_FORMAT, price_all: 0 }]

  return sourceVariants.map((variant, index) => {
    const title = getVariantTitle(variant)
    const existing = existingVariants[index]

    return {
      ...(existing?.id ? { id: existing.id } : {}),
      title,
      sku: existing?.sku || null,
      manage_inventory: false,
      allow_backorder: false,
      options: { [FORMAT_OPTION]: title },
      prices: [
        {
          amount: variant.price_all || 0,
          currency_code: CURRENCY_CODE,
        },
      ],
      metadata: {
        ...(existing?.metadata || {}),
        repaired_from_image_mapping: true,
        source_price: variant.source_price || null,
      },
    }
  })
}

async function getProductById(productModuleService: any, id: string) {
  const [product] = (await productModuleService.listProducts(
    { id },
    {
      relations: ["images", "variants", "options", "categories"],
      select: [
        "id",
        "title",
        "subtitle",
        "description",
        "handle",
        "status",
        "thumbnail",
        "metadata",
        "collection_id",
        "images.id",
        "images.url",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.metadata",
        "options.id",
        "options.title",
        "options.values.value",
        "categories.id",
      ],
      take: 1,
    }
  )) as MedusaProduct[]

  return product
}

async function findProductByAuditRow(productModuleService: any, row: AuditRow) {
  const id = row.medusa_state.corrupted_product?.id

  if (id) {
    const byId = await getProductById(productModuleService, id)

    if (byId) {
      return byId
    }
  }

  const [byHandle] = (await productModuleService.listProducts(
    { handle: row.corrupted_woo.current_slug },
    {
      relations: ["images", "variants", "options", "categories"],
      select: [
        "id",
        "title",
        "subtitle",
        "description",
        "handle",
        "status",
        "thumbnail",
        "metadata",
        "collection_id",
        "images.id",
        "images.url",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.metadata",
        "options.id",
        "options.title",
        "options.values.value",
        "categories.id",
      ],
      take: 1,
    }
  )) as MedusaProduct[]

  return byHandle
}

function buildUpdatePayload(row: AuditRow, product: MedusaProduct) {
  const title = row.image_to_source_mapping.source_titles[0]
  const handle = row.image_to_source_mapping.source_handles[0]
  const variants = buildVariantPayloads(row, product)
  const formatValues = [...new Set(variants.map((variant) => variant.title))]
  const metadata = {
    ...(product.metadata || {}),
    details: buildDetails(row),
    ingredients: row.official_content.content?.ingredients || "",
    how_to_use: row.official_content.how_to_use_al || "",
    how_to_use_source_en: row.official_content.content?.how_to_use || "",
    official_product_url: row.official_content.url,
    image_derived_repair_applied_at: new Date().toISOString(),
    image_derived_repair_source_product_id:
      row.image_to_source_mapping.source_product_ids[0] || null,
    image_derived_repair_source_handle: handle,
    image_derived_repair_previous_woocommerce_id: row.corrupted_woo.woo_id,
    image_derived_repair_previous_handle: row.corrupted_woo.current_slug,
    image_derived_repair_previous_title: row.corrupted_woo.current_name,
    image_derived_repair_image_ids: row.corrupted_woo.image_ids,
    imported_from: "image-derived-repair",
  }

  return {
    id: product.id,
    title,
    subtitle: null,
    description: getDescription(row),
    handle,
    status: ProductStatus.PUBLISHED,
    collection_id: product.collection_id || undefined,
    category_ids: product.categories?.map((category) => category.id) || undefined,
    options: [{ title: FORMAT_OPTION, values: formatValues }],
    variants,
    metadata,
  }
}

export default async function applyImageDerivedProductRepairs({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const dryRun = args?.includes("--dry-run") || args?.includes("dry-run")
  const report = JSON.parse(
    await fs.readFile(ENRICHED_REPORT_PATH, "utf8")
  ) as AuditRow[]
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = path.join(
    PRODUCTS_YCO_DATA_DIR,
    "repair-audits",
    `image-derived-product-repair-backup-${timestamp}.json`
  )
  const backup: Array<{
    audit_row: AuditRow
    product_before: MedusaProduct | null
    update_payload: unknown
  }> = []
  let updated = 0
  let skipped = 0

  for (const row of report) {
    const sourceTitle = row.image_to_source_mapping.source_titles[0]
    const sourceHandle = row.image_to_source_mapping.source_handles[0]

    if (!sourceTitle || !sourceHandle) {
      skipped += 1
      logger.warn(
        `Skipping ${row.corrupted_woo.woo_id}: missing source title or handle.`
      )
      continue
    }

    if (!row.official_content.content?.ingredients || !row.official_content.how_to_use_al) {
      skipped += 1
      logger.warn(
        `Skipping ${row.corrupted_woo.woo_id}: missing official ingredients or Albanian how-to.`
      )
      continue
    }

    const product = await findProductByAuditRow(productModuleService, row)

    if (!product) {
      skipped += 1
      logger.warn(
        `Skipping ${row.corrupted_woo.woo_id}: Medusa product not found for ${row.corrupted_woo.current_slug}.`
      )
      continue
    }

    const handleCollision = await productModuleService.listProducts(
      { handle: sourceHandle },
      { select: ["id", "title", "handle"], take: 2 }
    )
    const conflictingProduct = handleCollision.find(
      (candidate) => candidate.id !== product.id
    )

    if (conflictingProduct) {
      skipped += 1
      logger.warn(
        `Skipping ${row.corrupted_woo.woo_id}: target handle ${sourceHandle} already belongs to ${conflictingProduct.id}.`
      )
      continue
    }

    const payload = buildUpdatePayload(row, product)
    backup.push({
      audit_row: row,
      product_before: product,
      update_payload: payload,
    })

    if (dryRun) {
      logger.info(
        `DRY ${product.id}: ${product.title} (${product.handle}) -> ${sourceTitle} (${sourceHandle})`
      )
      continue
    }

    await updateProductsWorkflow(container).run({
      input: {
        products: [payload],
      },
    })

    updated += 1
    logger.info(
      `UPDATED ${product.id}: ${product.title} (${product.handle}) -> ${sourceTitle} (${sourceHandle})`
    )
  }

  await fs.writeFile(backupPath, JSON.stringify(backup, null, 2))

  logger.info(
    `Image-derived product repair ${dryRun ? "dry-run" : "apply"} complete. Updated=${updated}, skipped=${skipped}, backup=${backupPath}`
  )
}
