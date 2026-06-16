import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { headers } from "next/headers"
import { getRegion } from "@lib/data/regions"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Adresat",
  description: "Shikoni adresat tuaja",
}

export default async function Addresses({
  params,
}: {
  params: { countryCode: string }
}) {
  const { countryCode } = params
  const customer = await getCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Adresat e dërgesës</h1>
        <p className="text-base-regular">
          Shikoni dhe përditësoni adresat e dërgesës. Mund të shtoni sa adresa
          të dëshironi dhe t’i përdorni gjatë checkout-it.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
