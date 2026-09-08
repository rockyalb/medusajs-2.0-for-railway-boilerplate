import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Stagger, StaggerItem } from "@modules/common/components/motion"

type EditorialTile = {
  label: string
  href: string
  image: string
  alt: string
}

/* Photography carries the section, so the tiles link out by category rather
   than product. Order: men, body, face, hair. */
const TILES: EditorialTile[] = [
  {
    label: "Men care",
    href: "/categories/men-care",
    image: "/categories/men-care.webp",
    alt: "Profili i një burri me lëkurë të lagur pas dushit",
  },
  {
    label: "Body care",
    href: "/categories/body-care",
    image: "/categories/body-care.webp",
    alt: "Shpina e një gruaje nën dritën e diellit me hije gjethesh",
  },
  {
    label: "Face care",
    href: "/categories/skin-care",
    image: "/categories/face-care.webp",
    alt: "Fytyrë e mbuluar me shkumë pastruese",
  },
  {
    label: "Hair care",
    href: "/categories/hair-care",
    image: "/categories/hair-care.webp",
    alt: "Flokë të gjatë kafe të mbajtur me një drejtues",
  },
]

/** Editorial photo row that breaks the page's rounded-card rhythm: three
 *  full-bleed portraits with hard corners on a white ground, each captioned
 *  by a small link rather than a heading. It sits directly above the product
 *  of the month so the page moves from browsing into a single pick.
 *
 *  The photographs carry their own set wordmark, so the caption underneath
 *  stays small and utilitarian and reads as navigation, not as a repeat. */
export default function EditorialTiles() {
  return (
    <section className="yco-section bg-white px-6 py-12 small:py-20">
      <h2 className="sr-only">Kujdesi sipas kategorive</h2>

      <div className="mx-auto max-w-6xl">
        {/* The entrance animation is driven from the row, not per card. A card
            that only peeks in from the right is under any per-element in-view
            threshold, so it would sit at opacity 0 and pop in on first scroll —
            hiding the very sliver that signals the row scrolls. Staggering from
            the parent keeps the same cascade while the peek stays visible. */}
        <Stagger
          stagger={0.08}
          className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto px-6 pb-2 small:mx-0 small:grid small:grid-cols-4 small:gap-5 medium:gap-7 small:snap-none small:overflow-visible small:px-0 small:pb-0"
        >
          {TILES.map((tile) => (
            <StaggerItem
              key={tile.href}
              className="w-[76vw] shrink-0 snap-start small:w-auto"
            >
              <LocalizedClientLink
                href={tile.href}
                className="group block focus:outline-none"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-yco-panel">
                  <img
                    src={tile.image}
                    alt={tile.alt}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>

                <span className="mt-4 inline-block font-hanken text-[13px] font-bold uppercase tracking-[0.1em] text-yco-coral">
                  <span className="border-b border-transparent pb-1 transition-colors duration-300 group-hover:border-current group-focus-visible:border-current">
                    {tile.label}
                  </span>
                </span>
              </LocalizedClientLink>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
