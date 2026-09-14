import type { HttpTypes } from "@medusajs/types"

import RelatedProductsLoader from "./related-products-loader"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

type StoreProductWithTags = HttpTypes.StoreProduct & {
  tags?: { value: string }[] | null
}

/**
 * Keep recommendation context as a few primitives so the client loader does
 * not serialize the entire PDP product into the browser before it is needed.
 */
export default function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  if (!product.id) {
    return null
  }

  const productWithTags = product as StoreProductWithTags
  const tags = productWithTags.tags
    ?.map((tag) => tag.value)
    .filter(Boolean)

  return (
    <RelatedProductsLoader
      key={product.id}
      query={{
        countryCode,
        productId: product.id,
        collectionId: product.collection_id,
        tags: tags?.length ? tags : undefined,
      }}
    />
  )
}
