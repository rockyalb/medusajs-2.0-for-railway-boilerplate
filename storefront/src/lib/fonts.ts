import { Hanken_Grotesk } from "next/font/google"

// Single neutral grotesque used across the storefront.
// Mid weights stand in for Rhode's "Swiss" body type; 800/900 cover the
// heavy "Rektorat"-style display words. Exposed under both legacy CSS
// variables so existing `font-sans` / `font-serif` utilities keep working.
export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})
