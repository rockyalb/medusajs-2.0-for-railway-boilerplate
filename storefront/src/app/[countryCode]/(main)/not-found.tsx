import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404",
  description: "Diçka shkoi keq",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Faqja nuk u gjet</h1>
      <p className="text-small-regular text-ui-fg-base">
        Faqja që po kërkoni nuk ekziston.
      </p>
      <InteractiveLink href="/">Kthehu në kryefaqe</InteractiveLink>
    </div>
  )
}
