import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Hyr",
  description: "Hyni në llogarinë tuaj YCO.",
}

export default async function Login({
  searchParams,
}: {
  searchParams?: Promise<{ returnTo?: string; view?: string }>
}) {
  const params = await searchParams
  const returnTo = params?.returnTo === "/checkout" ? "/checkout" : undefined

  return <LoginTemplate returnTo={returnTo} initialView={params?.view} />
}
