import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** A dedicated brand feature keeps Here We Flo visible beyond the category and
 * general brand rails. The image is part of the imported Here We Flo CMS
 * library, while the CTA uses the live collection route. */
export default function HereWeFloSection() {
  return (
    <section className="yco-section bg-white/40 px-3 py-3 small:px-7 small:py-4">
      <div className="overflow-hidden rounded-rounded bg-[#ec459f]">
        <div className="grid small:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[300px] overflow-hidden small:min-h-[500px]">
            <img
              src="/cms/2025/01/flo-1260x840.webp"
              alt="Produkte Here We Flo për kujdesin organik të ciklit"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="m-3 flex flex-col justify-center rounded-large bg-yco-cream p-7 small:m-8 small:p-12">
            <p className="rhode-eyebrow">Kujdes menstrual organik</p>
            <h2 className="rhode-display mt-3 text-4xl md:text-5xl">
              Here We Flo
            </h2>
            <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-yco-charcoal-muted small:text-base">
              Produkte të buta për trupin, të krijuara me materiale organike
              dhe më të mira për planetin. Zbuloni përzgjedhjen Here We Flo.
            </p>
            <LocalizedClientLink
              href="/collections/here-we-flo"
              className="yco-btn yco-btn--blue mt-7 w-fit"
            >
              Shfleto koleksionin
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h13m-5-5 5 5-5 5" />
              </svg>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}
