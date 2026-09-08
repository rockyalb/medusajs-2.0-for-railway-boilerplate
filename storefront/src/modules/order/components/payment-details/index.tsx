import { Container, Heading, Text } from "@medusajs/ui"

import { isManual, isStripe, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-xl font-bold mb-4">
        Pagesa
      </Heading>
      <div>
        {!payment && (
          <Text className="text-sm text-yco-charcoal">
            Detajet e pagesës do të shfaqen sapo të përpunohen.
          </Text>
        )}
        {payment && (
          <div className="grid gap-4 xsmall:grid-cols-2">
            <div className="flex min-w-0 flex-col">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Metoda e pagesës
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment.provider_id]?.title ?? "Pagesë"}
              </Text>
            </div>
            <div className="flex min-w-0 flex-col">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Detajet e pagesës
              </Text>
              <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                  {paymentInfoMap[payment.provider_id]?.icon}
                </Container>
                <Text data-testid="payment-amount">
                  {isStripe(payment.provider_id) && payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : isManual(payment.provider_id)
                    ? "Pagesa kryhet në dorëzim"
                    : `${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })} paguar më ${new Date(
                        payment.created_at ?? ""
                      ).toLocaleString("sq-AL", {
                        timeZone: "Europe/Tirane",
                      })}`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
