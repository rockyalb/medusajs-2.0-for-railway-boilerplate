import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export type ProductHit = {
  id: string
  objectID?: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  variants: HttpTypes.StoreProductVariant[]
  collection_handle: string | null
  collection_id: string | null
}

type HitProps = {
  hit: ProductHit
}

const Hit = ({ hit }: HitProps) => {
  return (
    <LocalizedClientLink
      href={`/products/${hit.handle}`}
      data-testid="search-result"
      className="group block h-full"
    >
      <article
        key={hit.id}
        className="flex h-full w-full items-center gap-3 rounded-large border border-yco-cream-dark bg-yco-panel p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-pastel-coral/50 hover:bg-white hover:shadow-[0_22px_46px_-28px_rgba(252,140,132,0.9)] sm:flex-col sm:items-stretch sm:p-3"
      >
        <Thumbnail
          thumbnail={hit.thumbnail}
          size="square"
          className="h-16 w-16 shrink-0 rounded-rounded border border-white/70 bg-white p-1 shadow-none sm:h-auto sm:w-full"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:min-h-[5.75rem]">
          <div className="min-w-0">
            <p
              className="line-clamp-2 font-sans text-sm font-bold leading-snug text-yco-charcoal transition-colors duration-200 group-hover:text-pastel-coral-ink"
              data-testid="search-result-title"
            >
              {hit.title}
            </p>
            {hit.collection_handle && (
              <p className="mt-1 truncate font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-yco-charcoal-muted">
                {hit.collection_handle.replaceAll("-", " ")}
              </p>
            )}
          </div>
          <span className="inline-flex w-fit items-center gap-1 rounded-circle bg-white px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-yco-charcoal transition-colors duration-200 group-hover:bg-pastel-coral-soft group-hover:text-pastel-coral-ink">
            View product
          </span>
        </div>
      </article>
    </LocalizedClientLink>
  )
}

export default Hit
