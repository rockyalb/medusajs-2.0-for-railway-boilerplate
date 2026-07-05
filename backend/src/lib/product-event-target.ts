import { Modules } from "@medusajs/framework/utils"

type ProductEventData = {
  id?: string
  product_id?: string
  productId?: string
}

export const resolveProductIdFromEvent = async (
  container: any,
  data: ProductEventData,
  entity: "product" | "variant" | "image"
): Promise<string | null> => {
  if (entity === "product") {
    return data.id || data.product_id || data.productId || null
  }

  if (data.product_id || data.productId) {
    return data.product_id || data.productId || null
  }

  if (!data.id) {
    return null
  }

  const productModuleService = container.resolve(Modules.PRODUCT)

  if (entity === "variant") {
    const [variant] = await productModuleService.listProductVariants(
      { id: data.id },
      {
        select: ["id", "product_id"],
        take: 1,
      }
    )

    return variant?.product_id || null
  }

  const [product] = await productModuleService.listProducts(
    { images: { id: data.id } },
    {
      select: ["id"],
      take: 1,
    }
  )

  return product?.id || null
}
