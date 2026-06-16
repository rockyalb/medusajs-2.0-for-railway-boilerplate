import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Hyr",
  description: "Hyni në llogarinë tuaj YCO.",
}

export default async function Login({
  searchParams,
}: {
  searchParams?: Promise<{ returnTo?: string }>
}) {
  const returnTo = (await searchParams)?.returnTo

  return <LoginTemplate returnTo={returnTo} />
}
