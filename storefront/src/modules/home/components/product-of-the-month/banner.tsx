import LocalizedClientLink from "@modules/common/components/localized-client-link"

type PotmBannerProps = {
  title: string
  subtitle: string | null
  description: string | null
  homepageDescription: string | null
  whyChosen: string | null
  handle: string
  image: string
}

/** Full-width band on the animated logo-pastel wash. */
export default function PotmBanner({
  title,
  subtitle,
  description,
  homepageDescription,
  whyChosen,
  handle,
  image,
}: PotmBannerProps) {
  const customDescription = homepageDescription?.trim()
  const productCopy = customDescription || whyChosen || description || subtitle

  return (
    <section className="px-3 py-3 small:px-7 small:py-4">
      <div className="yco-potm relative overflow-hidden rounded-rounded">
        <p className="relative flex items-center gap-2 px-7 pt-7 font-sans text-xs font-bold uppercase tracking-[0.14em] text-yco-charcoal small:hidden">
          Produkti i muajit
        </p>

        <div className="relative grid min-h-[460px] grid-cols-1 items-center gap-0 small:min-h-[680px] small:grid-cols-[0.82fr_1.18fr]">
          <div className="order-2 max-w-xl p-7 pt-2 text-yco-charcoal small:order-1 small:p-14">
            <p className="mb-3 hidden items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.14em] small:flex">
              Produkti i muajit
            </p>
            <h2 className="rhode-display font-hanken text-2xl md:text-5xl">
              {title}
            </h2>
            {productCopy && (
              <div className="mt-4 max-w-md">
                {!customDescription && whyChosen && (
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-yco-charcoal-muted">
                    Pse u zgjodh produkti i muajit
                  </p>
                )}
                <p className="mt-2 font-sans text-sm leading-relaxed text-yco-charcoal/80 line-clamp-5 small:text-base">
                  {productCopy}
                </p>
              </div>
            )}
            <div className="mt-7">
              <LocalizedClientLink
                href={`/products/${handle}`}
                className="rhode-pill"
              >
                Zbulo produktin
              </LocalizedClientLink>
            </div>
          </div>

          <div className="order-1 flex h-full min-h-[340px] items-center justify-center overflow-hidden p-5 pb-0 small:order-2 small:min-h-[680px] small:p-8">
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="relative flex h-full w-full items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="aspect-[3/4] w-full object-cover small:aspect-auto small:max-h-[600px] small:object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-[3/4] w-full rounded-rounded bg-white/30 small:aspect-auto small:h-[600px]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
