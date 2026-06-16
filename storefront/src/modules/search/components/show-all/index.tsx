import { useHits, useInstantSearch, useSearchBox } from "react-instantsearch"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ShowAllProps = {
  shown: number
  total?: number
}

const ShowAll = ({ shown, total }: ShowAllProps) => {
  const { hits } = useHits()
  const { indexUiState } = useInstantSearch()
  const { query: searchBoxQuery } = useSearchBox()
  const query =
    typeof searchBoxQuery === "string"
      ? searchBoxQuery.trim()
      : typeof indexUiState.query === "string"
      ? indexUiState.query.trim()
      : ""

  if (query === "") return null

  if (hits.length === 0) {
    return (
      <div
        className="mt-3 rounded-large border border-yco-cream-dark bg-yco-panel p-6 text-center"
        data-testid="no-search-results-container"
      >
        <p className="font-sans text-lg font-black lowercase text-yco-charcoal">
          nuk u gjetën rezultate
        </p>
        <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-6 text-yco-charcoal-muted">
          Provoni një term më të gjerë, një emër brendi, ose shfletoni të
          gjithë dyqanin.
        </p>
        <LocalizedClientLink
          href="/store"
          className="yco-btn yco-btn--outline mt-5"
        >
          Shfleto dyqanin
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="mt-4 flex h-fit flex-col items-center justify-between gap-4 rounded-large border border-yco-cream-dark bg-white p-4 text-center small:flex-row small:text-left">
      <p className="font-sans text-sm font-semibold text-yco-charcoal-muted">
        Duke shfaqur {shown}
        {typeof total === "number" ? ` nga ${total}` : ""} rezultate.
      </p>
      {typeof total !== "number" || total > shown ? (
        <LocalizedClientLink
          href={`/results/${encodeURIComponent(query)}`}
          className="yco-btn yco-btn--coral min-h-[44px] w-full px-6 text-[0.7rem] small:w-auto"
        >
          Shiko të gjitha
        </LocalizedClientLink>
      ) : null}
    </div>
  )
}

export default ShowAll
