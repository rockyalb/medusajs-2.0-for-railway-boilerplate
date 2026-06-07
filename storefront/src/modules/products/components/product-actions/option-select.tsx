import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = option.values?.map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-yco-charcoal-muted">
        Select {title}
      </span>
      <div
        className="flex flex-wrap gap-2.5"
        data-testid={dataTestId}
      >
        {filteredOptions?.map((v) => {
          const isSelected = v === current
          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              className={clx(
                "h-11 min-w-[3.5rem] flex-1 rounded-circle border-2 px-4 text-sm font-semibold transition-all duration-200 active:translate-y-[2px]",
                {
                  "border-pastel-coral bg-pastel-coral-soft text-pastel-coral-ink shadow-[0_3px_0_0_#e0726a]":
                    isSelected,
                  "border-yco-cream-dark bg-white text-yco-charcoal hover:-translate-y-0.5 hover:border-pastel-coral/60":
                    !isSelected,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
