import { getBaseURL } from "@lib/util/env"
import { fontLabVariables, fredoka, hankenGrotesk, inter } from "@lib/fonts"
import { Metadata } from "next"
import MetaPixel from "@modules/analytics/components/meta-pixel"
import AmbientBackground from "@modules/home/components/ambient-background"
import FontLab from "@modules/common/components/font-lab"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

/* Pre-launch font comparison tool. Shown everywhere until launch; set
   NEXT_PUBLIC_FONT_LAB=false (or delete the component) to hide it. */
const showFontLab = process.env.NEXT_PUBLIC_FONT_LAB !== "false"

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${inter.variable} ${hankenGrotesk.variable} ${fredoka.variable} ${fontLabVariables}`}
    >
      <body>
        <AmbientBackground />
        <MetaPixel />
        <main className="relative z-10">{props.children}</main>
        {showFontLab && <FontLab />}
      </body>
    </html>
  )
}
