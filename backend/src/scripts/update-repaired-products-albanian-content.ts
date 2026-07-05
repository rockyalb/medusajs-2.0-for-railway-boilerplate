import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs/promises"
import path from "path"

type AuditRow = {
  image_to_source_mapping: {
    source_handles: string[]
    source_titles: string[]
  }
  official_content: {
    content: {
      ingredients?: string
      how_to_use?: string
    } | null
    how_to_use_al?: string
    url: string
  }
}

type MedusaProduct = {
  id: string
  title?: string | null
  handle?: string | null
  thumbnail?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
  variants?: Array<{ id: string; sku?: string | null }>
}

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

const ALBANIAN_CONTENT_BY_HANDLE: Record<
  string,
  { description: string; details: string }
> = {
  "calming-superactive": {
    description:
      "Serum qetesues per skalpin qe lehteson menjehere irritimin dhe ofron veprim qetesues efektiv e afatgjate.",
    details:
      "Qeteson dhe kujdeset per skalpet e ndjeshme, duke ofruar lehtesim te menjehershem nga dhimbja ose irritimi.",
  },
  "well-being-shampoo": {
    description:
      "Shampo e perditshme per floke te shendetshem. Formula e lehte, e pasuruar me ekstrakte dhe proteina, hidraton, mbron dhe ofron veprim antioksidues.",
    details:
      "Pastron butesisht, hidraton skalpin dhe floket, jep shkelqim dhe ka veprim antioksidues. Permban perberes aktiv natyrale.",
  },
  "renewing-shampoo": {
    description:
      "Shampo e bute trajtuese kunder plakjes se flokeve, qe ndihmon ne ruajtjen e mireqenies se skalpit dhe flokeve dhe promovon vitalitetin e tyre.",
    details:
      "Nxit rinovimin e qelizave te lekures, hidraton dhe i ben floket me te bute, me te shndritshem dhe me me shume trup.",
  },
  "nourishing-hair-royal-jelly-superactive": {
    description:
      "Trajtim mineralizues per skalp shume te dehidratuar. Locioni me qumesht blete ushqen dhe remineralizon skalpin.",
    details:
      "Qeteson dhe hidraton skalpin, duke e pergatitur per rritje me te shendetshme te flokeve.",
  },
  "this-is-an-extra-strong-hair-spray": {
    description:
      "Llak flokesh me mbajtje shume te forte per modele qe rezistojne ndaj lageshtires, kohes dhe levizjes, pa lene mbetje ngjitese.",
    details:
      "Ofron mbajtje ekstra te forte, rezistence ndaj lageshtires dhe ndihmon qe floket te duken me shkelqim, te sigurt dhe pa frizz.",
  },
  "this-is-a-medium-hold-finishing-gum": {
    description:
      "Gum stilues i lehte per krijimin e modeleve te lemuara dhe tekstures se percaktuar me mbajtje mesatare.",
    details:
      "Jep teksture dhe mbajtje te punueshme me efekt mat, pa mbetje ngjitese ose yndyrore.",
  },
  "well-being-conditioner": {
    description:
      "Kondicioner i perditshem per floke te shendetshem, i formuluar per te zberthyer, hidratuar dhe lene floket te bute e te mendafshte.",
    details:
      "Ndihmon krehjen, hidraton floket, jep shkelqim dhe ka veprim antioksidues me perberes aktiv natyrale.",
  },
  "energizing-gel": {
    description:
      "Xhel trajtues per floket e holle dhe te stresuar. Jep force, trup dhe efekt kozmetik rigjallerues.",
    details:
      "Ndihmon ne stimulimin e rritjes se flokeve dhe perforcon floket e dobet per te parandaluar keputjen ne te ardhmen.",
  },
  "calming-shampoo": {
    description:
      "Shampo qetesuese per skalpe te ndjeshme. Pastron butesisht, zbut dhe qeteson skalpin e sensibilizuar.",
    details:
      "Formule efektive qe pastron butesisht dhe qeteson skalpin. Permban perberes aktiv natyrale.",
  },
  "this-is-a-texturizing-serum": {
    description:
      "Serum flokesh qe krijon efekt teksturues pa humbur butesine apo punueshmerine. Ideal per trup, strukture dhe forme gjate tharjes.",
    details:
      "Jep teksture te lehte dhe mbajtje te bute, me efekt kondicionues e zbutës pa i renduar floket.",
  },
  "this-is-a-dry-texturizer": {
    description:
      "Sprej teksturues i thate per teksture te ndare, te percaktuar dhe me volum. I jep flokeve pamje te plote dhe natyrale pa i renduar.",
    details:
      "Krijon teksture, trup dhe volum me pamje natyrale. Floket duken te percaktuar dhe te levizshem.",
  },
  "this-is-a-shimmering-mist": {
    description:
      "Mjegull me shkelqim per floke te shndritshem dhe te bute, qe shton shkelqim dhe lufton frizz-in pa i renduar floket.",
    details:
      "I ben floket me shkelqim, te mendafshte dhe pa frizz.",
  },
  "purifying-gel": {
    description:
      "Trajtim xhel per pastrimin e skalpit te prirur ndaj zbokthit, me veprim antifungal dhe antibakterial per ta mbajtur skalpin te paster e te shendetshem.",
    details:
      "Lufton zbokthin e thate dhe te yndyrshem, qeteson irritimin dhe ndihmon qe skalpi te qendroje i paster e i shendetshem me kalimin e kohes.",
  },
}

async function findProduct(productModuleService: any, handle: string) {
  const [product] = (await productModuleService.listProducts(
    { handle },
    {
      relations: ["variants"],
      select: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "description",
        "metadata",
        "variants.id",
        "variants.sku",
      ],
      take: 1,
    }
  )) as MedusaProduct[]

  return product
}

function variantSku(product: MedusaProduct) {
  return (product.variants || [])
    .map((variant) => variant.sku)
    .filter(Boolean)
    .join(" ")
}

export default async function updateRepairedProductsAlbanianContent({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const rows = JSON.parse(await fs.readFile(ENRICHED_REPORT_PATH, "utf8")) as AuditRow[]
  const meiliDocs = []
  let updated = 0
  let skipped = 0

  for (const row of rows) {
    const handle = row.image_to_source_mapping.source_handles[0]
    const content = ALBANIAN_CONTENT_BY_HANDLE[handle]

    if (!handle || !content) {
      skipped += 1
      logger.warn(`Skipping ${handle || "unknown"}: missing Albanian content.`)
      continue
    }

    const product = await findProduct(productModuleService, handle)

    if (!product) {
      skipped += 1
      logger.warn(`Skipping ${handle}: Medusa product not found.`)
      continue
    }

    const metadata = {
      ...(product.metadata || {}),
      details: content.details,
      details_source_en: product.metadata?.details || "",
      ingredients: row.official_content.content?.ingredients || "",
      how_to_use: row.official_content.how_to_use_al || "",
      how_to_use_source_en: row.official_content.content?.how_to_use || "",
      official_product_url: row.official_content.url,
      albanian_content_updated_at: new Date().toISOString(),
    }

    await updateProductsWorkflow(container).run({
      input: {
        products: [
          {
            id: product.id,
            description: content.description,
            metadata,
          },
        ],
      },
    })

    updated += 1
    meiliDocs.push({
      id: product.id,
      title: product.title,
      description: content.description,
      handle: product.handle,
      variant_sku: variantSku(product),
      thumbnail: product.thumbnail,
    })
    logger.info(`UPDATED ${product.handle}: Albanian description/details.`)
  }

  const outPath = path.join(
    PRODUCTS_YCO_DATA_DIR,
    "repair-audits",
    "repaired-products-meili-docs.json"
  )
  await fs.writeFile(outPath, JSON.stringify(meiliDocs, null, 2))

  logger.info(
    `Albanian content update complete. Updated=${updated}, skipped=${skipped}, meili_docs=${outPath}`
  )
}
