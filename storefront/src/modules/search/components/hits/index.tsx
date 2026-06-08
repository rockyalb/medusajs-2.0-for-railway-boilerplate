import { clx } from "@medusajs/ui"
import React from "react"
import {
  UseHitsProps,
  useHits,
  useSearchBox,
  useStats,
} from "react-instantsearch-hooks-web"

import { ProductHit } from "../hit"
import ShowAll from "../show-all"

type HitsProps<THit> = React.ComponentProps<"div"> &
  UseHitsProps & {
    hitComponent: (props: { hit: THit }) => JSX.Element
  }

const Hits = ({
  hitComponent: Hit,
  className,
  ...props
}: HitsProps<ProductHit>) => {
  const { query } = useSearchBox()
  const { hits } = useHits(props)
  const { nbHits } = useStats()
  const hasQuery = query.trim().length > 0

  return (
    <div
      className={clx(
        "w-full transition-[height,max-height,opacity] duration-300 ease-in-out",
        className
      )}
    >
      {!hasQuery && (
        <div className="yco-search-empty rounded-large bg-yco-cream p-5 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="yco-accent-dot" aria-hidden />
            <p className="rhode-eyebrow">Start typing</p>
          </div>
          <h2 className="font-sans text-2xl font-black lowercase leading-none text-yco-charcoal sm:text-4xl">
            find your next refill
          </h2>
          <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-yco-charcoal-muted">
            Search products, brands, categories, or ingredients. Results will
            appear here as soon as you type.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["skin", "hair", "body", "davines"].map((term) => (
              <span
                key={term}
                className="rounded-circle border border-yco-cream-dark bg-yco-panel px-3 py-2 font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-yco-charcoal"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}
      <div
        className={clx(
          "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4",
          !hasQuery && "hidden"
        )}
        data-testid="search-results"
      >
        {hits.slice(0, 6).map((hit, index) => (
          <li
            key={hit.objectID ?? hit.id ?? index}
            className="yco-search-hit list-none"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <Hit hit={hit as unknown as ProductHit} />
          </li>
        ))}
      </div>
      <ShowAll total={nbHits} shown={Math.min(hits.length, 6)} />
    </div>
  )
}

export default Hits
