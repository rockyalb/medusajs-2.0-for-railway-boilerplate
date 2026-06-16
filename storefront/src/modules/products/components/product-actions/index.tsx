"use client"

import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import QuantityStepper from "@modules/common/components/quantity-stepper"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { buildMetaContents, trackMetaEvent } from "@lib/meta-pixel"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const countryCode = useParams().countryCode as string
  const hasSelectableVariants = (product.variants?.length ?? 0) > 1

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
  }

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  // Cap the selectable quantity by available inventory (TODO: real max inventory).
  const maxQuantity = useMemo(() => {
    if (!selectedVariant) {
      return 1
    }

    if (!selectedVariant.manage_inventory || selectedVariant.allow_backorder) {
      return 10
    }

    return Math.max(Math.min(selectedVariant.inventory_quantity ?? 0, 10), 1)
  }, [selectedVariant])

  // Reset the quantity when the variant changes.
  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant?.id])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })

    const price = (selectedVariant as any).calculated_price
    const itemPrice = price?.calculated_amount

    trackMetaEvent("AddToCart", {
      content_ids: [selectedVariant.id],
      content_name: product.title,
      content_type: "product",
      contents: buildMetaContents([
        {
          id: selectedVariant.id,
          item_price: itemPrice,
          quantity,
        },
      ]),
      currency: price?.currency_code?.toUpperCase() ?? region.currency_code?.toUpperCase(),
      value: typeof itemPrice === "number" ? itemPrice * quantity : undefined,
    })

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {hasSelectableVariants && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.title ?? ""]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <div className="flex items-center gap-3">
          <span className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-yco-charcoal-muted">
            Qty
          </span>
          <QuantityStepper
            quantity={quantity}
            onChange={setQuantity}
            max={maxQuantity}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding}
            data-testid="product-quantity-stepper"
          />
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || isAdding}
          className="yco-btn yco-btn--coral yco-btn--block"
          data-testid="add-product-button"
        >
          {isAdding ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Adding…
            </>
          ) : !selectedVariant ? (
            "Select variant"
          ) : !inStock ? (
            "Out of stock"
          ) : (
            "Add to cart"
          )}
        </button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          hasSelectableVariants={hasSelectableVariants}
        />
      </div>
    </>
  )
}
