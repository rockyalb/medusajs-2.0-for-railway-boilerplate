import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { getCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { getCustomerStoreCreditAccounts } from "@lib/data/loyalty"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Llogaria",
  description: "Përmbledhje e aktivitetit të llogarisë suaj.",
}

export const dynamic = "force-dynamic"

export default async function OverviewTemplate({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const customer = await getCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null
  const region = await getRegion(countryCode).catch(() => null)
  const creditAccounts = await getCustomerStoreCreditAccounts(
    region?.currency_code ?? "all"
  ).catch(() => [])

  if (!customer) {
    notFound()
  }

  return (
    <Overview customer={customer} orders={orders} creditAccounts={creditAccounts} />
  )
}
