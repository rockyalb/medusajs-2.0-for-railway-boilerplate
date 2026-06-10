"use client"

import { useRef } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Full-width editorial campaign band with a slow parallax photograph. */
export default function EditorialBanner() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <section ref={sectionRef} className="bg-white px-3 py-4 small:px-7 small:py-6">
      <div className="relative overflow-hidden rounded-rounded">
        <motion.img
          src="/placeholder-images/yco-real/featured-products.jpg"
          alt="Natural beauty products arranged on a neutral background"
          className="absolute inset-0 h-full w-full scale-[1.22] object-cover"
          style={reducedMotion ? undefined : { y: imageY }}
          loading="lazy"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-yco-coral/55 via-yco-coral/25 to-transparent"
        />

        <div className="relative flex min-h-[420px] flex-col justify-end p-7 small:min-h-[520px] small:p-14">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
            className="max-w-xl text-white"
          >
            <p className="rhode-eyebrow !text-white/80">The YCO edit</p>
            <h2 className="rhode-display mt-3 !text-white text-5xl md:text-6xl">
              the everyday edit
            </h2>
            <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-white/90 small:text-base">
              Essentials for skin, body and home — chosen with care so you
              don&apos;t have to.
            </p>
            <div className="mt-7">
              <LocalizedClientLink
                href="/store"
                className="rhode-pill !border-white !text-white hover:!bg-white hover:!text-yco-coral"
              >
                Shop the edit
              </LocalizedClientLink>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
