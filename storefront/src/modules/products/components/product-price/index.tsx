import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-yco-charcoal">
      <span
        className="font-hanken text-xl font-bold leading-none tracking-tight"
      >
        {!variant && "Nga "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <>
          <span
            className="font-sans text-xs text-yco-charcoal-muted line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
          <span className="rounded-circle bg-pastel-coral-soft px-2 py-0.5 font-sans text-[10px] font-bold text-pastel-coral-ink">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
