"use client"

import { useState } from "react"
import { Funnel } from "@medusajs/icons"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  variant?: "sidebar" | "inline"
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "created_at",
    label: "Latest Arrivals",
  },
  {
    value: "price_asc",
    label: "Price: Low -> High",
  },
  {
    value: "price_desc",
    label: "Price: High -> Low",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
  variant = "sidebar",
}: SortProductsProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
    setIsOpen(false)
  }

  if (variant === "inline") {
    return (
      <div
        className="relative ml-auto inline-flex shrink-0"
        data-testid={dataTestId}
      >
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center text-yco-charcoal transition-colors hover:text-yco-charcoal/70"
          aria-expanded={isOpen}
          aria-controls="plp-sort-options"
          aria-label="Filtro produktet"
          onClick={() => setIsOpen((current) => !current)}
        >
          <Funnel className="h-4 w-4" aria-hidden="true" />
        </button>
        {isOpen && (
          <div
            id="plp-sort-options"
            className="absolute right-0 top-full z-30 mt-2 flex w-56 flex-col overflow-hidden rounded-rounded border border-white/60 bg-white/40 shadow-[0_16px_34px_-30px_rgba(47,45,41,0.65)] backdrop-blur-sm"
          >
            {sortOptions.map((option) => {
              const isActive = option.value === sortBy

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`min-h-11 px-4 py-3 text-left text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-yco-charcoal text-white"
                      : "text-yco-charcoal hover:bg-white/70"
                  }`}
                  onClick={() => handleChange(option.value as SortOptions)}
                  data-testid="sort-by-link"
                  aria-pressed={isActive}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <FilterRadioGroup
      title="Sort by"
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
