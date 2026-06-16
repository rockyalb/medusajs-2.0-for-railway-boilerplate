import { Metadata } from "next"

import ProfilePhone from "@modules/account//components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePassword from "@modules/account/components/profile-password"

import { notFound } from "next/navigation"
import { getRegion, listRegions } from "@lib/data/regions"
import { getCustomer } from "@lib/data/customer"
import {
  getCustomerStoreCreditAccounts,
  getLoyaltyRewardSetting,
} from "@lib/data/loyalty"
import { convertToLocale } from "@lib/util/money"

export const metadata: Metadata = {
  title: "Profili",
  description: "Shikoni dhe ndryshoni profilin tuaj.",
}

export const dynamic = "force-dynamic"

export default async function Profile({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const customer = await getCustomer()
  const regions = await listRegions()
  const region = await getRegion(countryCode)

  if (!customer || !regions) {
    notFound()
  }

  const [creditAccounts, loyaltySettings] = await Promise.all([
    getCustomerStoreCreditAccounts(region?.currency_code ?? "all"),
    getLoyaltyRewardSetting(),
  ])

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Profili</h1>
        <p className="text-base-regular">
          Shikoni dhe përditësoni të dhënat e profilit, përfshirë emrin,
          email-in dhe telefonin. Mund të ndryshoni edhe adresën e faturimit
          ose fjalëkalimin.
        </p>
      </div>
      <div className="flex flex-col gap-y-8 w-full">
        {loyaltySettings.is_enabled && (
          <>
            <StoreCreditSection
              creditAccounts={creditAccounts}
              percentage={loyaltySettings.percentage}
            />
            <Divider />
          </>
        )}
        <ProfileName customer={customer} />
        <Divider />
        <ProfileEmail customer={customer} />
        <Divider />
        <ProfilePhone customer={customer} />
        <Divider />
        <ProfilePassword customer={customer} />
        <Divider />
        <ProfileBillingAddress customer={customer} regions={regions} />
      </div>
    </div>
  )
}

type StoreCreditSectionProps = {
  creditAccounts: Awaited<ReturnType<typeof getCustomerStoreCreditAccounts>>
  percentage: number
}

const StoreCreditSection = ({
  creditAccounts,
  percentage,
}: StoreCreditSectionProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-large-semi">Kredit dyqani</h3>
      </div>
      <p className="text-base-regular text-ui-fg-subtle">
        Fitoni {percentage}% kredit dyqani për çdo porosi. Kreditet shtohen
        automatikisht në llogarinë tuaj pas çdo blerjeje.
      </p>
      {creditAccounts.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          {creditAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between bg-ui-bg-subtle border border-ui-border-base px-4 py-3"
            >
              <span className="text-base-regular text-ui-fg-subtle uppercase">
                {account.currency_code}
              </span>
              <span className="text-xl-semi text-ui-fg-interactive">
                {convertToLocale({
                  amount: Number(account.balance),
                  currency_code: account.currency_code,
                })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-base-regular text-ui-fg-subtle">
          Nuk keni ende kredit dyqani. Vendosni një porosi për të filluar.
        </p>
      )}
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}
