import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** Brand feature for Here We Flo, laid out like the old ycorganics.com
 * homepage: the original pink product-stack artwork (B Corp badge and script
 * logo are part of the image) fills the panel, with the copy in a white card
 * on the left. Copy is the old site's; the CTA uses our button system and the
 * live collection route. */
export default function HereWeFloSection() {
  return (
    <section className="yco-section bg-white/40 px-3 py-3 small:px-7 small:py-4">
      <div className="relative overflow-hidden rounded-rounded bg-[#ec459f]">
        <img
          src="/cms/2024/04/here-we-flo-2048x1147.webp"
          srcSet="/cms/2024/04/here-we-flo-1024x573.webp 1024w, /cms/2024/04/here-we-flo-2048x1147.webp 2048w"
          sizes="(max-width: 1024px) 100vw, 1400px"
          alt="Produktet Here We Flo: peceta, tamponë dhe liners organikë me certifikim B Corporation"
          className="aspect-[16/9] w-full object-cover object-right small:aspect-[2048/1147] small:object-center"
          loading="lazy"
        />

        <div className="relative px-3 pb-4 pt-0 small:absolute small:inset-0 small:flex small:items-center small:px-12 small:py-16 medium:px-16">
          <div className="-mt-8 max-w-[440px] rounded-large bg-white p-7 shadow-[0_18px_40px_-20px_rgba(47,45,41,0.45)] small:mt-0 small:p-10">
            <h2 className="rhode-display text-3xl small:text-4xl">
              Kujdesi për ciklin Hipoalergjike Here We Flo
            </h2>
            <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed text-yco-charcoal-muted small:text-base">
              Brandi i pacipë, i pa turp, natyral &amp; organik për momentet më te
              lëmshme të muajit për herë të parë në Shqipëri.
            </p>
            <LocalizedClientLink
              href="/collections/here-we-flo"
              className="yco-btn yco-btn--blue mt-7 w-fit"
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
      </div>
    </section>
  )
}
