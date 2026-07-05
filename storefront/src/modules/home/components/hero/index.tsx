import HeroCopy from "./hero-copy"
import type { HomepageHeroSettings } from "@lib/data/homepage"

const DEFAULT_IMAGE_URL =
  "https://bucket-production-a1707.up.railway.app/medusa-media/static/yco-hero-davines-shampoo-01.jpg"
const DEFAULT_IMAGE_ALT = "Davines shampoo bottles on a light surface"

export default function Hero({
  settings,
}: {
  settings?: HomepageHeroSettings | null
}) {
  const imageUrl = settings?.image_url || DEFAULT_IMAGE_URL
  const imageAlt = settings?.image_alt || DEFAULT_IMAGE_ALT

  return (
    <section className="bs-rhode-hero bs-rhode-hero--rose">
      <div className="bs-rhode-hero__stage">
        <div className="bs-rhode-hero__image-wrap">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="bs-rhode-hero__image"
            fetchPriority="high"
          />
        </div>
        <HeroCopy
          eyebrow={settings?.eyebrow || undefined}
          headline={settings?.headline || undefined}
          ctaLabel={settings?.cta_label || undefined}
          ctaHref={settings?.cta_href || undefined}
        />
      </div>
    </section>
  )
}
