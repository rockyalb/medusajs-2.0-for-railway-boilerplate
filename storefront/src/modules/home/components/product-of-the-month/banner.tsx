"use client"

import { motion, useReducedMotion } from "motion/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Sparkles, {
  type Spark,
} from "@modules/home/components/ambient-background/sparkles"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/* Cores stay light so they feel like light, while the halo carries a
   saturated logo tint so each star still reads on the pale wash. */
const BAND_SPARKS: Spark[] = [
  { top: "12%", left: "6%", size: 26, dur: 5.6, delay: 0.6, color: "#ffffff", glow: "#7CA4EB", float: 10, dy: -8 },
  { top: "24%", left: "44%", size: 16, dur: 6.8, delay: 2.2, color: "#FEE2E0", glow: "#FC8C84", float: 12, dy: -6 },
  { top: "10%", left: "88%", size: 22, dur: 6.1, delay: 1.1, color: "#ffffff", glow: "#84C3AC", float: 11, dy: -7 },
  { top: "46%", left: "54%", size: 14, dur: 7.4, delay: 3.4, color: "#ffffff", glow: "#7CA4EB", float: 13, dy: -5 },
  { top: "64%", left: "7%", size: 20, dur: 6.3, delay: 0.3, color: "#E0F0EA", glow: "#84C3AC", float: 12, dy: -7 },
  { top: "80%", left: "36%", size: 24, dur: 5.8, delay: 2.8, color: "#ffffff", glow: "#FC8C84", float: 10, dy: -9 },
  { top: "72%", left: "92%", size: 16, dur: 7.0, delay: 1.7, color: "#DEE8FA", glow: "#7CA4EB", float: 14, dy: -6 },
  { top: "36%", left: "96%", size: 14, dur: 7.7, delay: 4.1, color: "#ffffff", glow: "#84C3AC", float: 11, dy: -5 },
]

type PotmBannerProps = {
  title: string
  subtitle: string | null
  description: string | null
  whyChosen: string | null
  handle: string
  image: string
  price: string | null
  originalPrice: string | null
  monthLabel: string
}

/** Full-width band on the animated logo-pastel wash. The product card
    springs in from off-canvas, settles at a tilt, then floats in place. */
export default function PotmBanner({
  title,
  subtitle,
  description,
  whyChosen,
  handle,
  image,
  price,
  originalPrice,
  monthLabel,
}: PotmBannerProps) {
  const reducedMotion = useReducedMotion()
  const productCopy = whyChosen || description || subtitle

  return (
    <section className="px-3 py-3 small:px-7 small:py-4">
      <div className="yco-potm relative overflow-hidden rounded-rounded">
        <Sparkles sparks={BAND_SPARKS} />

        <p className="relative flex items-center gap-2 px-7 pt-7 font-sans text-xs font-bold uppercase tracking-[0.14em] text-yco-charcoal small:hidden">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12 7.5-1.8 11.1-5.4 12-12Z" />
          </svg>
          Produkti i muajit — {monthLabel}
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
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12 7.5-1.8 11.1-5.4 12-12Z" />
              </svg>
              Produkti i muajit — {monthLabel}
            </p>
            <h2 className="rhode-display font-hanken text-4xl md:text-5xl">
              {title}
            </h2>
            {productCopy && (
              <div className="mt-4 max-w-md">
                {whyChosen && (
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-yco-charcoal-muted">
                    Pse u zgjodh produkti i muajit
                  </p>
                )}
                <p className="mt-2 font-sans text-sm leading-relaxed text-yco-charcoal/80 line-clamp-5 small:text-base">
                  {productCopy}
                </p>
              </div>
            )}
            {price && (
              <p className="mt-5 font-sans text-lg font-bold">
                {price}
                {originalPrice && (
                  <span className="ml-3 text-sm font-normal text-yco-charcoal/60 line-through">
                    {originalPrice}
                  </span>
                )}
              </p>
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
              className="relative flex h-full w-full max-w-[360px] items-center justify-center small:max-w-none"
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
                <span className="absolute left-4 top-2 z-[2] rounded-circle bg-yco-charcoal px-4 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-white small:left-8 small:top-8">
                  {monthLabel}
                </span>
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="max-h-[330px] w-full object-contain small:max-h-[600px]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-[330px] w-full rounded-rounded bg-white/30 small:h-[600px]" />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
