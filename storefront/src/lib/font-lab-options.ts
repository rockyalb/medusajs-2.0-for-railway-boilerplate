/** Candidate typefaces for the pre-launch font comparison. Plain data so the
 * client-side switcher can import it without pulling in next/font. Every
 * entry maps to a font loaded in `@lib/fonts` under the same CSS variable. */
export type FontOption = {
  id: string
  label: string
  cssVar: string
  /** One-line note on the feel of the face, shown in the picker. */
  note: string
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "fredoka",
    label: "Fredoka",
    cssVar: "--font-fredoka",
    note: "Former brand font. Rounded, playful, a bit toy-like at small sizes.",
  },
  {
    id: "hanken",
    label: "Hanken Grotesk",
    cssVar: "--font-hanken",
    note: "Former nav font. Neutral grotesque, very legible.",
  },
  {
    id: "nunito",
    label: "Nunito",
    cssVar: "--font-nunito",
    note: "Rounded terminals like Fredoka but calmer and more readable.",
  },
  {
    id: "quicksand",
    label: "Quicksand",
    cssVar: "--font-quicksand",
    note: "Light, airy, rounded geometric. Spa and wellness feel.",
  },
  {
    id: "outfit",
    label: "Outfit",
    cssVar: "--font-outfit",
    note: "Clean geometric, modern. Strong for big display headings.",
  },
  {
    id: "plus-jakarta",
    label: "Plus Jakarta Sans",
    cssVar: "--font-plus-jakarta",
    note: "Friendly but premium. Popular with DTC beauty brands.",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    cssVar: "--font-dm-sans",
    note: "Low-contrast geometric, quiet and trustworthy.",
  },
  {
    id: "manrope",
    label: "Manrope",
    cssVar: "--font-manrope",
    note: "Semi-geometric with open shapes. Very balanced for body copy.",
  },
  {
    id: "figtree",
    label: "Figtree",
    cssVar: "--font-figtree",
    note: "Friendly geometric with soft curves. Warm without being cute.",
  },
  {
    id: "urbanist",
    label: "Urbanist",
    cssVar: "--font-urbanist",
    note: "Elegant, slightly fashion-forward geometric.",
  },
  {
    id: "albert-sans",
    label: "Albert Sans",
    cssVar: "--font-albert-sans",
    note: "Neutral humanist sans. Disappears behind the content.",
  },
  {
    id: "onest",
    label: "Onest",
    cssVar: "--font-onest",
    note: "Modern, slightly rounded. Good balance of character and clarity.",
  },
  {
    id: "lexend",
    label: "Lexend",
    cssVar: "--font-lexend",
    note: "Designed for reading ease. Wide, open, accessible.",
  },
  {
    id: "sora",
    label: "Sora",
    cssVar: "--font-sora",
    note: "Geometric with personality. Tech-leaning, crisp headlines.",
  },
  {
    id: "poppins",
    label: "Poppins",
    cssVar: "--font-poppins",
    note: "Classic geometric. Familiar, maybe too common.",
  },
  {
    id: "baloo",
    label: "Baloo 2",
    cssVar: "--font-baloo",
    note: "Current heading font. Chunky rounded display, refined at large sizes.",
  },
  {
    id: "comfortaa",
    label: "Comfortaa",
    cssVar: "--font-comfortaa",
    note: "Current body & nav font. Very round and soft, organic feel.",
  },
]

export const DEFAULT_HEADING_FONT = "baloo"
export const DEFAULT_BRAND_FONT = "comfortaa"
export const DEFAULT_UI_FONT = "comfortaa"
/* Bumped with the Baloo 2 + Comfortaa switch. The old key holds selections
   made against the retired Fredoka / Hanken defaults, and those would be
   replayed as explicit overrides and quietly undo the new pairing. */
export const FONT_LAB_STORAGE_KEY = "yco-font-lab-v2"
