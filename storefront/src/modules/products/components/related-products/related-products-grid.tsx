"use client"

import type { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"

import { getProductCardData } from "../product-preview/product-card-data"
import ProductCard from "../product-card"
import { loadRelatedProductsPage } from "./actions"
import { RELATED_PRODUCTS_PAGE_SIZE } from "./constants"
import type { RelatedProductsQuery } from "./data"

type RelatedProductsGridProps = {
  initialProducts: HttpTypes.StoreProduct[]
  initialNextOffset: number | null
  query: RelatedProductsQuery
}

const RELATED_PRODUCT_IMAGE_SIZES =
  "(max-width: 1023px) calc(50vw - 2rem), (max-width: 1440px) calc(25vw - 1.875rem), 330px"

export default function RelatedProductsGrid({
  initialProducts,
  initialNextOffset,
  query,
}: RelatedProductsGridProps) {
  const [products, setProducts] = useState(initialProducts)
  const [nextOffset, setNextOffset] = useState(initialNextOffset)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadMore = async () => {
    if (nextOffset === null || isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await loadRelatedProductsPage({
        ...query,
        offset: nextOffset,
        limit: RELATED_PRODUCTS_PAGE_SIZE,
      })
      if (!mountedRef.current) {
        return
      }

      setProducts((currentProducts) => {
        const existingIds = new Set(currentProducts.map((product) => product.id))
        const additions = result.products.filter(
          (product) => !existingIds.has(product.id)
        )
        return [...currentProducts, ...additions]
      })
      setNextOffset(result.nextOffset)
    } catch {
      if (mountedRef.current) {
        setError("Nuk mund të ngarkoheshin produktet e tjera.")
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4 small:gap-x-6">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={getProductCardData(product)}
              imageSizes={RELATED_PRODUCT_IMAGE_SIZES}
            />
          </li>
        ))}
      </ul>

      {nextOffset !== null && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="rhode-pill"
            onClick={loadMore}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? "Po ngarkohen…" : "See more"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-yco-charcoal-muted" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
