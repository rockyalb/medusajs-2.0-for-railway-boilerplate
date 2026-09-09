import { getBaseURL } from "@lib/util/env"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@lib/util/site"
import { baloo2, comfortaa, fontLabVariables } from "@lib/fonts"
import { Metadata } from "next"
import MetaPixel from "@modules/analytics/components/meta-pixel"
import AmbientBackground from "@modules/home/components/ambient-background"
import FontLab from "@modules/common/components/font-lab"
import "styles/globals.css"

/* Site-wide defaults. Any page that exports its own `title` overrides this one
   outright; pages that don't (the homepage included) inherit it. Next derives
   og:title/og:description from `title`/`description`, and picks up the card
   image from src/app/opengraph-image.jpg, so neither needs restating here. */
export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "sq_AL",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
}

/* Font comparison tool. Opt-in: set NEXT_PUBLIC_FONT_LAB=true on a preview
   deploy or in local dev to get it. Off everywhere else, which also keeps the
   candidate typefaces out of the production bundle — see below. */
const showFontLab = process.env.NEXT_PUBLIC_FONT_LAB === "true"

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${baloo2.variable} ${comfortaa.variable}${
        showFontLab ? ` ${fontLabVariables}` : ""
      }`}
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
