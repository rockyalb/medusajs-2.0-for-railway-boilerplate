"use client"

import Link from "next/link"
import { useRef } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"

/* Scroll-driven storytelling: the imagery stays pinned (CSS sticky — native
   scrolling, no hijacking) while the three brand pillars scroll past. The
   photo layers drift at different rates for gentle parallax depth. */

const STORY_STEPS = [
  {
    index: "01",
    eyebrow: "Formulas",
    title: "good for you",
    text: "What you put on your body matters as much as what you put in it. Every brand we carry is hand-selected for clean, high-performance formulas.",
  },
  {
    index: "02",
    eyebrow: "Planet",
    title: "good for the planet",
    text: "Packaging that respects the planet — sustainable, plastic-free wherever possible, and designed to leave nothing behind.",
  },
  {
    index: "03",
    eyebrow: "Trust",
    title: "good to know",
    text: "Certified organic, cruelty-free and non-toxic. Every ingredient is approved before a product ever reaches our shelves.",
  },
]

export default function MissionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"])
  const cardY = useTransform(scrollYProgress, [0, 1], ["14%", "-26%"])
  const lineScale = useTransform(scrollYProgress, [0.15, 0.85], [0, 1])

  return (
    <section
      ref={sectionRef}
      className="bg-yco-panel px-6 py-16 small:py-24"
      aria-labelledby="mission-heading"
    >
      <div className="mx-auto grid max-w-6xl gap-10 small:grid-cols-[0.95fr_1.05fr] small:gap-16">
        <div className="relative">
          <div className="small:sticky small:top-28">
            <span className="rhode-eyebrow inline-flex items-center gap-2">
              <span className="yco-accent-dot" aria-hidden />
              Our philosophy
            </span>
            <h2
              id="mission-heading"
              className="rhode-display mt-3 text-4xl md:text-5xl"
            >
              good for you,
              <br />
              good for the planet.
            </h2>
            <div className="yco-tricolor-rule mt-4" />

            <div className="relative mt-8 overflow-hidden rounded-large bg-white">
              <motion.img
                src="/placeholder-images/yco-real/mission.jpg"
                alt="YCO clean beauty lifestyle photography"
                className="aspect-[4/5] w-full scale-[1.1] object-cover small:aspect-[3/4]"
                style={reducedMotion ? undefined : { y: imageY }}
                loading="lazy"
              />
              <motion.figure
                className="absolute bottom-6 right-6 w-[38%] overflow-hidden rounded-rounded border border-white/70 bg-white shadow-xl"
                style={reducedMotion ? undefined : { y: cardY }}
              >
                <img
                  src="/placeholder-images/yco-real/category-skin.webp"
                  alt="Natural skincare products"
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-yco-charcoal">
                  Clean beauty edit
                </figcaption>
              </motion.figure>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-center gap-14 small:gap-28 small:py-20">
          <motion.span
            aria-hidden
            className="absolute bottom-2 left-[5px] top-2 hidden w-px origin-top bg-yco-charcoal/20 small:block"
            style={reducedMotion ? undefined : { scaleY: lineScale }}
          />

          {STORY_STEPS.map((step) => (
            <motion.article
              key={step.index}
              className="relative small:pl-12"
              initial={reducedMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-1.5 hidden h-[11px] w-[11px] rounded-circle border border-yco-charcoal/30 bg-yco-panel small:block"
              />
              <p className="rhode-eyebrow">
                {step.index} — {step.eyebrow}
              </p>
              <h3 className="rhode-display mt-3 text-3xl md:text-4xl">
                {step.title}
              </h3>
              <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-yco-charcoal-muted small:text-base">
                {step.text}
              </p>
            </motion.article>
          ))}

          <motion.div
            className="relative small:pl-12"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/store" className="rhode-pill">
              Bli në YCO
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
