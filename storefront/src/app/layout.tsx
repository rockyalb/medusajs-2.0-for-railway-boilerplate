import { getBaseURL } from "@lib/util/env"
import { fredoka, hankenGrotesk } from "@lib/fonts"
import { Metadata } from "next"
import MetaPixel from "@modules/analytics/components/meta-pixel"
import AmbientBackground from "@modules/home/components/ambient-background"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${hankenGrotesk.variable} ${fredoka.variable}`}
    >
      <body>
        <AmbientBackground />
        <MetaPixel />
        <main className="relative z-10">{props.children}</main>
      </body>
    </html>
  )
}
