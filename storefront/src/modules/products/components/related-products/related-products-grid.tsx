"use client"

import { Children, ReactNode, useState } from "react"

type RelatedProductsGridProps = {
  children: ReactNode
}

const INITIAL_PRODUCT_COUNT = 2
const LOAD_MORE_COUNT = 6

export default function RelatedProductsGrid({
  children,
}: RelatedProductsGridProps) {
  const products = Children.toArray(children)
  const [visibleCount, setVisibleCount] = useState(INITIAL_PRODUCT_COUNT)
  const hasMore = visibleCount < products.length

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4 small:gap-x-6">
        {products.slice(0, visibleCount)}
      </ul>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="rhode-pill"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + LOAD_MORE_COUNT, products.length)
              )
            }
          >
            See more
          </button>
        </div>
      )}
    </>
  )
}
