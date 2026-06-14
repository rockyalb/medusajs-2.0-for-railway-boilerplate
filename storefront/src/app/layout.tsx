import { getBaseURL } from "@lib/util/env"
import { hankenGrotesk } from "@lib/fonts"
import { Metadata } from "next"
import MetaPixel from "@modules/analytics/components/meta-pixel"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={hankenGrotesk.variable}>
      <body>
        <MetaPixel />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
