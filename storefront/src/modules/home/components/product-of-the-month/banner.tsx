"use client"

import { motion, useReducedMotion } from "motion/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
const EASE_OUT = [0.22, 1, 0.36, 1] as const

type PotmBannerProps = {
  title: string
  subtitle: string | null
  description: string | null
  homepageDescription: string | null
  whyChosen: string | null
  handle: string
  image: string
}

/** Full-width band on the animated logo-pastel wash. The product card
    springs in from off-canvas, settles at a tilt, then floats in place. */
export default function PotmBanner({
  title,
  subtitle,
  description,
  homepageDescription,
  whyChosen,
  handle,
  image,
}: PotmBannerProps) {
  const reducedMotion = useReducedMotion()
  const customDescription = homepageDescription?.trim()
  const productCopy = customDescription || whyChosen || description || subtitle

  return (
    <section className="px-3 py-3 small:px-7 small:py-4">
      <div className="yco-potm relative overflow-hidden rounded-rounded">
        <p className="relative flex items-center gap-2 px-7 pt-7 font-sans text-xs font-bold uppercase tracking-[0.14em] text-yco-charcoal small:hidden">
          Produkti i muajit
        </p>

        <div className="relative grid min-h-[460px] grid-cols-1 items-center gap-0 small:min-h-[680px] small:grid-cols-[0.82fr_1.18fr]">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
            className="order-2 max-w-xl p-7 pt-2 text-yco-charcoal small:order-1 small:p-14"
          >
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
          </motion.div>

          <div className="order-1 flex h-full min-h-[340px] items-center justify-center overflow-hidden p-5 pb-0 small:order-2 small:min-h-[680px] small:p-8">
            <motion.div
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, x: 80, y: 24, scale: 0.92 }
              }
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                type: "spring",
                stiffness: 55,
                damping: 13,
                mass: 1.1,
              }}
              className="relative flex h-full w-full items-center justify-center"
            >
              <motion.div
                animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.6,
                }}
                className="relative flex h-full w-full items-center justify-center"
              >
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
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
