"use client"

import type { HttpTypes } from "@medusajs/types"
import { useCallback, useEffect, useRef, useState } from "react"

import { loadRelatedProductsPage } from "./actions"
import { RELATED_PRODUCTS_INITIAL_LIMIT } from "./constants"
import type { RelatedProductsQuery } from "./data"
import RelatedProductsGrid from "./related-products-grid"

type RelatedProductsLoaderProps = {
  query: RelatedProductsQuery
}

const RelatedProductsPlaceholder = () => (
  <ul
    className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4 small:gap-x-6"
    aria-hidden="true"
  >
    {[0, 1].map((placeholder) => (
      <li key={placeholder} className="overflow-hidden rounded-large">
        <div className="aspect-[2/3] animate-pulse rounded-large bg-yco-panel small:aspect-[3/4] motion-reduce:animate-none" />
      </li>
    ))}
  </ul>
)

export default function RelatedProductsLoader({
  query,
}: RelatedProductsLoaderProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const requestedRef = useRef(false)
  const mountedRef = useRef(true)
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestInitialProducts = useCallback(async () => {
    if (requestedRef.current) {
      return
    }

    requestedRef.current = true
    setIsLoading(true)

    try {
      const result = await loadRelatedProductsPage({
        ...query,
        offset: 0,
        limit: RELATED_PRODUCTS_INITIAL_LIMIT,
      })
      if (!mountedRef.current) {
        return
      }
      setProducts(result.products)
      setNextOffset(result.nextOffset)
      setError(null)
    } catch {
      if (!mountedRef.current) {
        return
      }
      setError("Nuk mund të ngarkoheshin produktet e ngjashme.")
    } finally {
      if (mountedRef.current) {
        setHasLoaded(true)
        setIsLoading(false)
      }
    }
  }, [query])

  useEffect(() => {
    const element = sectionRef.current
    if (!element) {
      return
    }

    if (!("IntersectionObserver" in window)) {
      void requestInitialProducts()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        observer.disconnect()
        void requestInitialProducts()
      },
      // Start shortly before the rail enters the viewport so the first cards
      // are ready during a normal scroll without competing with the PDP hero.
      { rootMargin: "600px 0px" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [requestInitialProducts])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  if (hasLoaded && !products.length && !error) {
    return null
  }

  return (
    <section ref={sectionRef} className="product-page-constraint">
      <h2 className="rhode-display mb-8 text-3xl small:mb-10 small:text-4xl">
        Related products
      </h2>

      {hasLoaded && products.length ? (
        <RelatedProductsGrid
          initialProducts={products}
          initialNextOffset={nextOffset}
          query={query}
        />
      ) : error ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-yco-charcoal-muted" role="alert">
            {error}
          </p>
          <button
            type="button"
            className="rhode-pill"
            onClick={() => {
              requestedRef.current = false
              setHasLoaded(false)
              setError(null)
              void requestInitialProducts()
            }}
          >
            Provo përsëri
          </button>
        </div>
      ) : (
        <RelatedProductsPlaceholder />
      )}

      {isLoading && (
        <p className="mt-4 text-center text-sm text-yco-charcoal-muted" role="status">
          Po ngarkohen produktet…
        </p>
      )}
    </section>
  )
}
