import { z } from "@medusajs/framework/zod"

const nullableText = z.string().max(2000).nullable().optional()

export const AdminUpdateHomepageSchema = z.object({
  product_of_the_month: z.object({
    product_id: z.string().trim().min(1).max(200).nullable(),
    description: z.string().trim().max(2000).nullable(),
  }).optional(),
  hero: z
    .object({
      image_url: nullableText,
      image_alt: nullableText,
      eyebrow: nullableText,
      headline: nullableText,
      cta_label: nullableText,
      cta_href: nullableText,
    })
    .optional(),
  category_cards: z
    .object({
      images: z.record(z.string(), z.string().max(2000)),
    })
    .optional(),
  bestsellers: z
    .object({
      product_ids: z.array(z.string()).max(24),
    })
    .optional(),
})

export type AdminUpdateHomepageType = z.infer<typeof AdminUpdateHomepageSchema>
