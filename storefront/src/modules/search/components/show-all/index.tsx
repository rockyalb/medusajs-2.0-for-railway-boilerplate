import { Container, Text } from "@medusajs/ui"
import { useHits, useSearchBox } from "react-instantsearch-hooks-web"

import InteractiveLink from "@modules/common/components/interactive-link"

type ShowAllProps = {
  shown: number
  total?: number
}

const ShowAll = ({ shown, total }: ShowAllProps) => {
  const { hits } = useHits()
  const { query } = useSearchBox()

  if (query === "") return null

  if (hits.length === 0) {
    return (
      <Container
        className="flex gap-2 justify-center h-fit py-2"
        data-testid="no-search-results-container"
      >
        <Text>No results found.</Text>
      </Container>
    )
  }

  return (
    <Container className="flex h-fit flex-col items-center justify-center gap-1.5 py-3 text-center small:flex-row small:gap-2 small:py-2">
      <Text>
        Showing {shown}
        {typeof total === "number" ? ` of ${total}` : ""} results.
      </Text>
      {typeof total !== "number" || total > shown ? (
        <InteractiveLink href={`/results/${query}`}>View all</InteractiveLink>
      ) : null}
    </Container>
  )
}

export default ShowAll
