"use client"

import { motion, useReducedMotion } from "motion/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const EYEBROW = "MIRË PËR JU, MIRË PËR PLANETIN."
const HEADLINE = "Shtëpia e produkteve zero-waste, organike dhe natyrale."
const SUPPORT =
  "Brende të besuara, përbërës natyralë dhe paketime që respektojnë planetin — të gjitha në një vend."

export default function HeroCopy() {
  const reducedMotion = useReducedMotion()
  const words = HEADLINE.split(" ")

  return (
    <div className="bs-rhode-hero__copy">
      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
        className="bs-rhode-hero__eyebrow"
      >
        <span className="yco-accent-dot" aria-hidden />
        {EYEBROW}
      </motion.p>

      <h1 aria-label={HEADLINE}>
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
              {index < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.62 }}
        className="bs-rhode-hero__support"
      >
        {SUPPORT}
      </motion.p>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.78 }}
        className="flex flex-wrap items-center gap-3"
      >
        <LocalizedClientLink href="/store" className="yco-btn yco-btn--ink">
          Shiko produktet
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/collections"
          className="yco-btn yco-btn--outline"
        >
          Zbulo brendet
        </LocalizedClientLink>
      </motion.div>
    </div>
  )
}
