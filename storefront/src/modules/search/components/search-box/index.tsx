import { XMarkMini } from "@medusajs/icons"
import { FormEvent } from "react"

import SearchBoxWrapper, {
  ControlledSearchBoxProps,
} from "../search-box-wrapper"

const ControlledSearchBox = ({
  inputRef,
  onChange,
  onReset,
  onSubmit,
  placeholder,
  value,
  ...props
}: ControlledSearchBoxProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (onSubmit) {
      onSubmit(event)
    }

    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleReset = (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onReset(event)

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div {...props} className="w-full">
      <form action="" noValidate onSubmit={handleSubmit} onReset={handleReset}>
        <div className="flex items-center justify-between">
          <input
            ref={inputRef}
            data-testid="search-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={placeholder}
            spellCheck={false}
            type="search"
            value={value}
            onChange={onChange}
            className="h-9 min-w-0 flex-1 bg-transparent font-sans text-base font-semibold text-yco-charcoal placeholder:text-yco-charcoal-muted focus:outline-none"
          />
          {value && (
            <button
              onClick={handleReset}
              type="button"
              aria-label="Clear search"
              className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-circle border border-yco-charcoal/20 px-3 font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-yco-charcoal transition-colors duration-200 hover:bg-yco-charcoal hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-pastel-coral/50"
            >
              <XMarkMini />
              <span className="hidden xsmall:inline">Clear</span>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

const SearchBox = () => {
  return (
    <SearchBoxWrapper>
      {(props) => {
        return (
          <>
            <ControlledSearchBox {...props} />
          </>
        )
      }}
    </SearchBoxWrapper>
  )
}

export default SearchBox
