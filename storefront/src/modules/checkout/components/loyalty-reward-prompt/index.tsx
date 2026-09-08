import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LoyaltyRewardPromptProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  percentage: number
  isEnabled: boolean
  isActive: boolean
  endDate?: string | null
}

const LoyaltyRewardPrompt = ({
  cart,
  customer,
  percentage,
  isEnabled,
  isActive,
  endDate,
}: LoyaltyRewardPromptProps) => {
  if (!isEnabled || !isActive || percentage <= 0) {
    return null
  }

  const rewardBase = cart.item_total ?? cart.subtotal ?? 0
  const estimatedReward =
    Math.round(((rewardBase * percentage) / 100) * 100) / 100
  const formattedReward = convertToLocale({
    amount: estimatedReward,
    currency_code: cart.currency_code,
  })
  const formattedEndDate = endDate
    ? new Intl.DateTimeFormat("sq-AL", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(endDate))
    : null

  return (
    <section
      className="relative overflow-hidden rounded-large border border-pastel-mint/60 bg-pastel-mint-soft/60 p-5 small:p-6"
      aria-label="Përfitimet e llogarisë YCO"
    >
      <div className="flex flex-col gap-5 small:flex-row small:items-center small:justify-between">
        <div className="flex items-start gap-4">
          <div
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pastel-mint text-2xl font-bold text-yco-coral"
          >
            {percentage}%
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-pastel-mint-ink">
              Blerjet e tua të shpërblejnë
            </p>
            <h2 className="text-xl font-bold text-yco-coral">
              Pak kujdes për veten. Një bonus për herën tjetër.
            </h2>
            <Text size="small" className="mt-2 text-yco-charcoal">
              {customer
                ? `Kjo porosi mund të shtojë rreth ${formattedReward} kredit në llogarinë tënde.`
                : `Hyr ose krijo llogarinë tënde dhe përfito rreth ${formattedReward} kredit nga kjo porosi.`}
              {formattedEndDate
                ? ` Oferta përfundon më ${formattedEndDate}.`
                : ""}
            </Text>
          </div>
        </div>
        {!customer && (
          <div className="flex shrink-0 flex-col gap-2 xsmall:flex-row small:flex-col">
            <LocalizedClientLink
              href="/account?view=register&returnTo=/checkout"
              className="yco-btn yco-btn--ink min-h-11 text-center"
            >
              Krijo llogari · Fillo të përfitosh
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account?returnTo=/checkout"
              className="yco-btn yco-btn--outline min-h-11 text-center"
            >
              Kam llogari · Hyr
            </LocalizedClientLink>
          </div>
        )}
      </div>
      <p className="mt-4 border-t border-pastel-mint/50 pt-3 text-xs leading-relaxed text-yco-charcoal">
        Përdore kredinë kur bilanci arrin 500 ALL, deri në 25% të vlerës së
        produkteve me TVSH. Transporti nuk përfshihet.
      </p>
    </section>
  )
}

export default LoyaltyRewardPrompt
