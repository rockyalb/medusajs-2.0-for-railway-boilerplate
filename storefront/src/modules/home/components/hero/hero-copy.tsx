"use client"

import { motion, useReducedMotion } from "motion/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const DEFAULT_EYEBROW = "MIRË PËR JU, MIRË PËR PLANETIN."
const DEFAULT_HEADLINE = "Shtëpia e produkteve zero-waste, organike dhe natyrale."
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
  const reducedMotion = useReducedMotion()
  const words = headline.split(" ")

  return (
    <div className="bs-rhode-hero__copy">
      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
        className="bs-rhode-hero__eyebrow"
      >
        <span className="yco-accent-dot" aria-hidden />
        {eyebrow}
      </motion.p>

      <h1 aria-label={headline}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            aria-hidden
            className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
          >
            <motion.span
              className="inline-block will-change-transform"
              initial={reducedMotion ? false : { y: "112%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.85,
                ease: EASE_OUT,
                delay: 0.22 + index * 0.055,
              }}
            >
              {word}
              {index < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.62 }}
        className="flex flex-wrap items-center gap-3"
      >
        <LocalizedClientLink href={ctaHref} className="yco-btn yco-btn--hero-blue">
          {ctaLabel}
        </LocalizedClientLink>
      </motion.div>
    </div>
  )
}
