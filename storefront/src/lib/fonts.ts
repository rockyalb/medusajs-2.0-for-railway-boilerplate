import {
  Albert_Sans,
  Baloo_2,
  Comfortaa,
  DM_Sans,
  Figtree,
  Fredoka,
  Hanken_Grotesk,
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

/* ── Shipped pairing ──────────────────────────────────────────────────────
   Baloo 2 for headings, Comfortaa for body and nav/UI. Both are variable
   fonts, so each is one file across its whole weight range. */

/** Display face: h1–h3 and anything using the `display`/`serif` families. */
export const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
})

/** Text face: body copy (`sans`) and the header/nav (`hanken`). */
export const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
})

/* The previous pairing. Reachable only through the font lab now, so
   `preload: false` keeps them off the critical path — the browser fetches
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
   a few @font-face rules and nothing more. `preload: false` keeps every
   candidate off the initial document's critical path. Delete this block (and the
   matching entries in `font-lab-options.ts`) once a font is chosen. All of
   these are variable fonts, so no weight list is needed. */
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap", preload: false })
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", display: "swap", preload: false })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap", preload: false })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta", display: "swap", preload: false })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap", preload: false })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", preload: false })
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap", preload: false })
const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap", preload: false })
const albertSans = Albert_Sans({ subsets: ["latin"], variable: "--font-albert-sans", display: "swap", preload: false })
const onest = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap", preload: false })
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend", display: "swap", preload: false })
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", preload: false })
/* Baloo 2 and Comfortaa are declared above as the shipped pairing; the lab
   references their variables directly rather than loading them twice. */
/* Poppins is a static family, so it needs explicit weights. */
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
  weight: ["300", "400", "500", "600", "700"],
})

/** Class names that expose every candidate's CSS variable on <html>. Applied
 * only when the lab is actually rendered, so production ships two faces. */
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
  fredoka,
  hankenGrotesk,
  poppins,
]
  .map((font) => font.variable)
  .join(" ")
