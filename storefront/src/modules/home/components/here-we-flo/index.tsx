import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** Brand feature for Here We Flo: the campaign photo on the left, the old
 * ycorganics.com copy on the right, in our own type and button styles.
 *
 * Height note: the panel is capped near a third of the viewport at every
 * width, so the section reads as a band between the brand rail and the trust
 * badges rather than a second hero.
 *
 * The photo is a 4:5 portrait and must never be cropped, so its box carries
 * that exact ratio: on desktop the box takes the panel height and derives its
 * width, on mobile it takes a share of the width and derives its height. The
 * ratio matches the file, so `object-cover` has nothing to trim. */
export default function HereWeFloSection() {
  return (
    <section className="yco-section bg-white/40 px-3 py-3 small:px-7 small:py-4">
      <div className="flex h-[29vh] min-h-[196px] max-h-[290px] overflow-hidden rounded-rounded bg-[#f3e3f4] small:h-[28vh] small:min-h-[224px] small:max-h-[340px]">
        <div className="aspect-[4/5] w-[44%] shrink-0 self-center small:h-full small:w-auto small:self-stretch">
          <img
            src="/cms/2024/04/here-we-flo-pads.webp"
            alt="Peceta dhe liners Flo për ndjeshmëri, të certifikuara OEKO-TEX"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 small:px-10 small:py-6">
          <h2 className="rhode-display text-base leading-tight small:text-3xl medium:text-4xl">
            Kujdesi për ciklin Hipoalergjike Here We Flo
          </h2>
          <p className="mt-2 max-w-md font-sans text-[11px] leading-snug text-yco-charcoal-muted small:mt-4 small:text-sm small:leading-relaxed">
            Brandi i pacipë, i pa turp, natyral &amp; organik për momentet më te
            lëmshme të muajit për herë të parë në Shqipëri.
          </p>
          <LocalizedClientLink
            href="/collections/here-we-flo"
            className="yco-btn yco-btn--blue mt-3 w-fit small:mt-6"
          >
            Më shumë
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
    </section>
  )
}
