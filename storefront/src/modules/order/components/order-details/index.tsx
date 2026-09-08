import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div>
      <Text>
        I kemi dërguar detajet e konfirmimit të porosisë te{" "}
        <span
          className="text-yco-coral font-semibold break-all"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Data e porosisë:{" "}
        <span data-testid="order-date">
          {new Intl.DateTimeFormat("sq-AL", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Europe/Tirane",
          }).format(new Date(order.created_at))}
        </span>
      </Text>
      <Text className="mt-2 font-semibold text-yco-coral">
        Numri i porosisë: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div
        className={
          showStatus
            ? "flex flex-wrap items-center text-compact-small gap-4 mt-4"
            : "hidden"
        }
      >
        {showStatus && (
          <>
            <Text>
              Statusi i porosisë:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {/* TODO: Check where the statuses should come from */}
                {/* {formatStatus(order.fulfillment_status)} */}
              </span>
            </Text>
            <Text>
              Statusi i pagesës:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {/* {formatStatus(order.payment_status)} */}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
