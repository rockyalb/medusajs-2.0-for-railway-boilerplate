import {
  Albert_Sans,
  Baloo_2,
  Comfortaa,
  DM_Sans,
  Figtree,
  Fredoka,
  Hanken_Grotesk,
  Inter,
  Lexend,
  Manrope,
  Nunito,
  Onest,
  Outfit,
  Plus_Jakarta_Sans,
  Poppins,
  Quicksand,
  Sora,
  Urbanist,
} from "next/font/google"

/* Site-wide default typeface. Self-hosted by next/font, variable axis so every
   weight from 100–900 comes out of one file. Tailwind's `sans`, `serif` and
   `hanken` families all fall back to this, so it covers every element unless
   the font lab points `--font-brand` / `--font-ui` somewhere else. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

/* The former brand pairing. Now reachable only through the font lab, so
   `preload: false` keeps them out of the critical path — the browser fetches
   them the moment something is rendered in them and not before. */
export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  preload: false,
  weight: ["300", "400", "500", "600", "700"],
})

export const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
  preload: false,
  weight: ["300", "400", "500", "600", "700"],
})

/* ── Font lab candidates ──────────────────────────────────────────────────
   Loaded only so the pre-launch font switcher can swap them in. Browsers
   download a face only once text is rendered in it, so the unused ones cost
   a few @font-face rules and nothing more. Delete this block (and the
   matching entries in `font-lab-options.ts`) once a font is chosen. All of
   these are variable fonts, so no weight list is needed. */
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" })
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", display: "swap" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta", display: "swap" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" })
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" })
const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap" })
const albertSans = Albert_Sans({ subsets: ["latin"], variable: "--font-albert-sans", display: "swap" })
const onest = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap" })
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend", display: "swap" })
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" })
const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo", display: "swap" })
const comfortaa = Comfortaa({ subsets: ["latin"], variable: "--font-comfortaa", display: "swap" })
/* Poppins is a static family, so it needs explicit weights. */
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

/** Class names that expose every candidate's CSS variable on <html>. */
export const fontLabVariables = [
  nunito,
  quicksand,
  outfit,
  plusJakarta,
  dmSans,
  manrope,
  figtree,
  urbanist,
  albertSans,
  onest,
  lexend,
  sora,
  baloo,
  comfortaa,
  poppins,
]
  .map((font) => font.variable)
  .join(" ")
