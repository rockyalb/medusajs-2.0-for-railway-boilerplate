"use client"

import { motion, useReducedMotion } from "motion/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Sparkles, {
  type Spark,
} from "@modules/home/components/ambient-background/sparkles"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/* Deeper tints of the logo pastels so the sparks read on the pale wash. */
const BAND_SPARKS: Spark[] = [
  { top: "14%", left: "6%", size: 13, dur: 5.4, delay: 0.6, color: "#ffffff" },
  { top: "22%", left: "44%", size: 9, dur: 6.6, delay: 2.2, color: "#e9a89c" },
  { top: "12%", left: "88%", size: 12, dur: 5.9, delay: 1.1, color: "#ffffff" },
  { top: "48%", left: "52%", size: 8, dur: 7.2, delay: 3.4, color: "#93b6ec" },
  { top: "66%", left: "8%", size: 10, dur: 6.1, delay: 0.3, color: "#8ec7aa" },
  { top: "80%", left: "38%", size: 12, dur: 5.6, delay: 2.8, color: "#ffffff" },
  { top: "72%", left: "92%", size: 9, dur: 6.8, delay: 1.7, color: "#e9a89c" },
  { top: "38%", left: "96%", size: 8, dur: 7.5, delay: 4.1, color: "#ffffff" },
]

type PotmBannerProps = {
  title: string
  subtitle: string | null
  description: string | null
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
  handle,
  image,
  price,
  originalPrice,
  monthLabel,
}: PotmBannerProps) {
  const reducedMotion = useReducedMotion()

  return (
    <section className="px-3 py-3 small:px-7 small:py-4">
      <div className="yco-potm relative overflow-hidden rounded-rounded">
        <Sparkles sparks={BAND_SPARKS} />

        <div className="relative grid min-h-[420px] grid-cols-1 items-center gap-2 small:min-h-[520px] small:grid-cols-2">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
            className="order-2 max-w-xl p-7 pt-2 text-yco-charcoal small:order-1 small:p-14"
          >
            <p className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.14em]">
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
            {subtitle && (
              <p className="mt-2 font-sans text-sm font-semibold text-yco-charcoal/70">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-yco-charcoal/80 line-clamp-4 small:text-base">
                {description}
              </p>
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

          <div className="order-1 flex items-center justify-center p-7 pb-0 small:order-2 small:p-12">
            <motion.div
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, x: 160, y: 90, rotate: 14, scale: 0.82 }
              }
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: -3, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                type: "spring",
                stiffness: 55,
                damping: 13,
                mass: 1.1,
              }}
              className="w-full max-w-[320px] small:max-w-[380px]"
            >
              <motion.div
                animate={reducedMotion ? undefined : { y: [0, -12, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.6,
                }}
                className="relative rounded-large border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-sm small:p-8"
              >
                <span className="absolute -top-3 left-6 rounded-circle bg-yco-charcoal px-4 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  {monthLabel}
                </span>
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="h-[240px] w-full rounded-rounded object-contain small:h-[320px]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-[240px] w-full rounded-rounded bg-yco-cream small:h-[320px]" />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
