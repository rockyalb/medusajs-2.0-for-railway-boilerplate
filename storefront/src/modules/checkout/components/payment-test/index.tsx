import { Badge } from "@medusajs/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">Kujdes:</span> Vetëm për testim.
    </Badge>
  )
}

export default PaymentTest
