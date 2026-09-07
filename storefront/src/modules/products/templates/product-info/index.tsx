import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const normalizedTitle = product.title.trim().toLocaleLowerCase()
  const displayTitle = normalizedTitle
    ? normalizedTitle.charAt(0).toLocaleUpperCase() + normalizedTitle.slice(1)
    : product.title

  return (
    <div id="product-info">
      <div>
        <Heading
          level="h2"
          className="rhode-display max-w-full break-words text-[clamp(22px,5.5vw,28px)] leading-[1.02] small:text-[clamp(24px,3.5dvh,32px)]"
          data-testid="product-title"
        >
          {displayTitle}
        </Heading>

        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="rhode-eyebrow mt-2 inline-block hover:text-yco-charcoal"
            data-testid="product-brand"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}

        <Text
          className="mt-4 max-w-2xl whitespace-pre-line font-sans text-sm leading-6 text-yco-charcoal small:mt-[clamp(0.5rem,1.5dvh,1rem)] small:text-[clamp(14px,1.8dvh,16px)] small:leading-relaxed"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
