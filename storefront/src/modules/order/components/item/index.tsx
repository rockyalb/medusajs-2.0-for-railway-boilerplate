import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
}

const Item = ({ item }: ItemProps) => {
  return (
    <li
      className="grid w-full grid-cols-[4rem_minmax(0,1fr)] gap-x-3 gap-y-2 py-4 small:grid-cols-[6rem_minmax(0,1fr)_auto] small:gap-x-4"
      data-testid="product-row"
    >
      <div className="row-span-2 flex w-16 self-center small:w-24">
        <Thumbnail thumbnail={item.thumbnail} size="square" />
      </div>

      <div className="min-w-0 self-end text-left small:self-center">
        <Text
          className="txt-medium-plus break-words text-ui-fg-base"
          data-testid="product-name"
        >
          {item.title}
        </Text>
        {item.variant &&
          !["default", "default variant"].includes(
            item.variant.title?.toLowerCase() ?? ""
          ) && (
            <LineItemOptions
              variant={item.variant}
              data-testid="product-variant"
            />
          )}
      </div>

      <div className="col-start-2 flex min-w-0 items-end justify-between gap-3 small:col-start-3 small:row-start-1 small:row-span-2 small:flex-col small:items-end small:justify-center">
        <Text className="shrink-0 text-sm text-ui-fg-muted">
          <span data-testid="product-quantity">{item.quantity}</span>x
        </Text>
        <span className="min-w-0 text-right tabular-nums">
          <LineItemPrice item={item} style="tight" />
        </span>
      </div>
    </li>
  )
}

export default Item
