import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** Stack the full 4:5 campaign photo above the copy on mobile.
 * Desktop keeps the compact, height-capped image-and-copy band. */
export default function HereWeFloSection() {
  return (
    <section className="yco-section bg-white/40 px-3 py-3 small:px-7 small:py-4">
      <div className="flex flex-col overflow-hidden rounded-rounded bg-[#f3e3f4] small:h-[28vh] small:min-h-[248px] small:max-h-[340px] small:flex-row">
        <div className="aspect-[4/5] w-full shrink-0 small:h-full small:w-auto small:self-stretch">
          <img
            src="/cms/2024/04/here-we-flo-pads.webp"
            alt="Peceta dhe liners Flo për ndjeshmëri, të certifikuara OEKO-TEX"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 small:px-10 small:py-6">
          <h2 className="rhode-display text-xl leading-tight small:text-3xl medium:text-4xl">
            Kujdesi për ciklin Here We Flo
          </h2>
          <p className="mt-2 max-w-md font-sans text-[13px] leading-relaxed text-yco-charcoal-muted small:mt-4 small:text-[15px] small:leading-relaxed">
            Brandi i pacipë, i pa turp, natyral &amp; organik për momentet më te
            lëmshme të muajit për herë të parë në Shqipëri.
          </p>
          <LocalizedClientLink
            href="/collections/here-we-flo"
            className="yco-btn yco-btn--blue mt-3 w-fit font-normal small:mt-6"
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
