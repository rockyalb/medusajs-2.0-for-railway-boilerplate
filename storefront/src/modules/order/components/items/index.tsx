import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/order/components/item"

type ItemsProps = {
  items: HttpTypes.StoreCartLineItem[] | HttpTypes.StoreOrderLineItem[] | null
}

const Items = ({ items }: ItemsProps) => {
  return (
    <ul
      className="divide-y divide-yco-cream-dark border-t border-yco-cream-dark bg-transparent"
      data-testid="products-table"
    >
      {items?.length
        ? [...items]
            .sort((a, b) => {
              return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
            })
            .map((item) => <Item key={item.id} item={item} />)
        : repeat(5).map((i) => (
            <li
              key={i}
              className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 py-4"
            >
              <span className="aspect-square animate-pulse rounded-rounded bg-yco-panel-dark" />
              <span className="my-auto h-4 animate-pulse rounded-soft bg-yco-panel-dark" />
            </li>
          ))}
    </ul>
  )
}

export default Items
