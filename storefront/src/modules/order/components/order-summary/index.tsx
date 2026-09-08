import { HttpTypes } from "@medusajs/types"
import CartTotals from "@modules/common/components/cart-totals"

const OrderSummary = ({ order }: { order: HttpTypes.StoreOrder }) => (
  <div>
    <h2 className="mb-5 text-xl font-bold text-yco-charcoal">
      Përmbledhja e porosisë
    </h2>
    <CartTotals totals={order} />
  </div>
)

export default OrderSummary
