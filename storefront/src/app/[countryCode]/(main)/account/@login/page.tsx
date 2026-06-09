import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Medusa Store account.",
}

export default async function Login({
  searchParams,
}: {
  searchParams?: Promise<{ returnTo?: string }>
}) {
  const returnTo = (await searchParams)?.returnTo

  return <LoginTemplate returnTo={returnTo} />
}
