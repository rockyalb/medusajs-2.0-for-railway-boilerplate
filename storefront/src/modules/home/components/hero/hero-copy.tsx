import LocalizedClientLink from "@modules/common/components/localized-client-link"

const DEFAULT_EYEBROW = "MIRË PËR JU, MIRË PËR PLANETIN."
const DEFAULT_HEADLINE =
  "Shtëpia e produkteve zero-waste, organike dhe natyrale."
const DEFAULT_CTA_LABEL = "Shiko produktet"
const DEFAULT_CTA_HREF = "/store"

export default function HeroCopy({
  eyebrow = DEFAULT_EYEBROW,
  headline = DEFAULT_HEADLINE,
  ctaLabel = DEFAULT_CTA_LABEL,
  ctaHref = DEFAULT_CTA_HREF,
}: {
  eyebrow?: string
  headline?: string
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <div className="bs-rhode-hero__copy">
      <p className="bs-rhode-hero__eyebrow font-normal">{eyebrow}</p>

      <h1>{headline}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <LocalizedClientLink
          href={ctaHref}
          className="yco-btn yco-btn--hero-blue"
        >
          {ctaLabel}
        </LocalizedClientLink>
      </div>
    </div>
  )
}
