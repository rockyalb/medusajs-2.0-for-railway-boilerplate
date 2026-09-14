import Image from "next/image"
import HeroCopy from "./hero-copy"
import type { HomepageHeroSettings } from "@lib/data/homepage"
import { isOptimizableImageUrl } from "@lib/util/image-host"

const DEFAULT_IMAGE_URL =
  "https://bucket-production-a1707.up.railway.app/medusa-media/static/yco-hero-davines-shampoo-01.jpg"
const DEFAULT_IMAGE_ALT = "Davines shampoo bottles on a light surface"

/**
 * The image is absolutely positioned inside `.bs-rhode-hero__image-wrap`
 * (object-fit: cover), so `fill` is the right mode. On phones the wrap is
 * full width; on `small:` and up it is the 56% grid column. `sizes` keeps the
 * srcset candidate close to the rendered width so a phone downloads a
 * ~800px WebP instead of the 1379x1600 source JPEG — this is the LCP element.
 */
const HERO_IMAGE_SIZES = "(max-width: 1023px) 100vw, 56vw"

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
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            fetchPriority="high"
            sizes={HERO_IMAGE_SIZES}
            quality={75}
            unoptimized={!isOptimizableImageUrl(imageUrl)}
            className="bs-rhode-hero__image"
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
