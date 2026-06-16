import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  items?: HttpTypes.StoreCartLineItem[]
}

const ItemsTemplate = ({ items }: ItemsTemplateProps) => {
  return (
    <div>
      <div className="flex items-end justify-between gap-4 pb-5">
        <div>
          <p className="rhode-eyebrow">Shporta e blerjeve</p>
          <Heading className="rhode-display mt-1 text-4xl">Shporta</Heading>
        </div>
      </div>
      <Table className="overflow-hidden rounded-large border border-yco-cream-dark">
        <Table.Header className="border-t-0 bg-yco-panel">
          <Table.Row className="txt-medium-plus text-yco-charcoal-muted">
            <Table.HeaderCell className="!pl-0">Produkti</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell>Sasia</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">
              Çmimi
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right">
              Totali
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return <Item key={item.id} item={item} />
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
