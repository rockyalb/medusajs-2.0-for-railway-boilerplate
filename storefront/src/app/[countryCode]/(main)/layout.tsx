import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// Deliberately does not read the customer: getCustomer() reads cookies, which
// would make every route under this layout — including the prerendered
// homepage — render per request. PostHog identification happens in the account
// and checkout layouts, which are per-visitor anyway, and the identified
// distinct ID persists in the browser for events captured elsewhere.
export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {props.children}
      <Footer />
    </>
  )
}
