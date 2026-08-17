"use client"

import { ArrowRightMini } from "@medusajs/icons"
import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { ReactNode } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EASE = [0.22, 1, 0.36, 1] as const

const principles = [
  {
    title: "Përzgjedhje e kujdesshme",
    copy: "Studiojmë formulimet, përbërësit dhe filozofinë pas çdo marke që sjellim.",
  },
  {
    title: "Transparencë mbi premtimet",
    copy: "Kërkojmë produkte që qëndrojnë pas asaj që thonë dhe komunikojnë qartë atë që ofrojnë.",
  },
  {
    title: "Ide që ecin përpara",
    copy: "Ndjekim zhvillimet e shkencës në bukuri, mirëqenie dhe kujdesin e përditshëm.",
  },
  {
    title: "Kujdes për të ardhmen",
    copy: "Zgjedhjet tona marrin parasysh si mirëqenien personale, ashtu edhe planetin ku jetojmë.",
  },
]

function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: ReactNode
  className?: string
  direction?: "up" | "left" | "right"
  delay?: number
}) {
  const reducedMotion = useReducedMotion()
  const offset =
    direction === "left"
      ? { x: -36 }
      : direction === "right"
      ? { x: 36 }
      : { y: 28 }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.72, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function AboutStory() {
  const reducedMotion = useReducedMotion()

  return (
    <main className="overflow-hidden bg-yco-cream text-yco-charcoal">
      <section className="relative border-b border-yco-cream-dark bg-yco-panel">
        <div className="content-container grid grid-cols-1 small:min-h-[680px] small:grid-cols-12">
          <div className="relative z-10 flex flex-col justify-center py-16 small:col-span-5 small:py-24">
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="font-hanken text-xs font-bold uppercase tracking-[0.18em] text-yco-charcoal"
            >
              Young · Clean · Organic
            </motion.p>

            <h1 className="rhode-display mt-6 max-w-[8ch] font-sans text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.94] tracking-[-0.025em] text-yco-charcoal">
              <span className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={reducedMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
                >
                  Ne jemi
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-2">
                <motion.span
                  className="block text-pastel-coral-ink"
                  initial={reducedMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.17, ease: EASE }}
                >
                  YCO.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.32, ease: EASE }}
              className="mt-7 max-w-[31ch] font-hanken text-lg font-medium leading-[1.55] small:text-xl"
            >
              Një mënyrë më e ndershme për t&apos;u kujdesur për veten, me
              zgjedhje që respektojnë edhe planetin.
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.44, ease: EASE }}
              className="mt-8"
            >
              <LocalizedClientLink
                href="/store"
                className="yco-btn yco-btn--coral inline-flex min-h-11 items-center gap-2 px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2"
              >
                Zbulo produktet
                <ArrowRightMini />
              </LocalizedClientLink>
            </motion.div>
          </div>

          <motion.div
            initial={
              reducedMotion
                ? false
                : { clipPath: "inset(0 0 0 100%)", scale: 1.035 }
            }
            animate={{ clipPath: "inset(0 0 0 0%)", scale: 1 }}
            transition={{ duration: 1, delay: 0.12, ease: EASE }}
            className="relative -mx-6 aspect-[4/3] overflow-hidden small:col-span-7 small:mx-0 small:ml-10 small:aspect-auto"
          >
            <Image
              src="/cms/2024/03/our-story-product1.webp"
              alt="Produkte të përzgjedhura për kujdesin e lëkurës në një kompozim pastel"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 58vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 right-5 rounded-circle bg-white/90 px-4 py-2 font-hanken text-xs font-bold text-yco-charcoal shadow-sm">
              YCO · që nga 2021
            </div>
          </motion.div>
        </div>
      </section>

      <section className="content-container py-20 small:py-32">
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="font-sans text-[clamp(2rem,4.6vw,4.25rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-yco-charcoal text-balance">
            Ne besojmë se kujdesi për veten nuk duhet t&apos;i kushtojë planetit
            të ardhmen.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-yco-cream-dark bg-pastel-coral-soft/50">
        <div className="content-container grid grid-cols-1 items-center gap-12 py-20 small:grid-cols-12 small:gap-10 small:py-28">
          <motion.div
            initial={
              reducedMotion
                ? false
                : { clipPath: "inset(100% 0 0 0)", scale: 1.025 }
            }
            whileInView={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative aspect-[2/3] overflow-hidden rounded-large small:col-span-5 small:aspect-[4/5]"
          >
            <Image
              src="/cms/2024/03/our-story-product2.webp"
              alt="Përzgjedhje produktesh për fytyrën dhe trupin në tone të buta"
              fill
              sizes="(max-width: 1023px) 100vw, 42vw"
              className="object-cover"
            />
          </motion.div>

          <div className="small:col-span-6 small:col-start-7">
            <Reveal direction="right">
              <p className="font-hanken text-sm font-bold text-pastel-coral-ink">
                Filloi në 2021.
              </p>
              <h2 className="mt-4 max-w-[14ch] font-sans text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-balance">
                Një histori e ndërtuar mbi besim.
              </h2>
            </Reveal>
            <Reveal direction="right" delay={0.1} className="mt-8 space-y-5">
              <p className="max-w-[62ch] font-hanken text-base leading-[1.75] small:text-lg">
                Nisëm rrugëtimin tonë për të thyer tabu dhe klishe të vjetra mes
                konsumatorit dhe biznesit. Që në fillim, synimi ishte të
                krijonim një hapësirë ku produktet e ndershme dhe informacioni i
                qartë ecin bashkë.
              </p>
              <p className="max-w-[62ch] font-hanken text-base leading-[1.75] small:text-lg">
                Sot vazhdojmë të kërkojmë marka me ide të guximshme, formulime
                të menduara dhe standarde që mbështesin atë që premtojnë.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-pastel-mint-soft/70">
        <div className="content-container grid grid-cols-1 gap-12 py-20 small:grid-cols-12 small:gap-10 small:py-32">
          <Reveal direction="left" className="small:col-span-5">
            <h2 className="max-w-[11ch] font-sans text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-balance">
              Pse YCO?
            </h2>
          </Reveal>

          <div className="space-y-10 small:col-span-6 small:col-start-7">
            <Reveal direction="right">
              <p className="font-sans text-[clamp(1.5rem,2.7vw,2.5rem)] font-medium leading-[1.22] tracking-[-0.015em] text-balance">
                Sepse shëndeti i brendshëm dhe ai i jashtëm janë të lidhur.
              </p>
            </Reveal>
            <Reveal direction="right" delay={0.08}>
              <p className="max-w-[62ch] font-hanken text-base leading-[1.75] small:text-lg">
                Jemi seriozë në studimin e markave që sjellim: nga formulimet
                dhe përbërësit, deri te koncepti dhe përgjegjësia pas tyre. Çdo
                përzgjedhje kalon nëpër një filtër të kujdesshëm, që të jetë sa
                më pranë asaj që përfaqëson YCO.
              </p>
            </Reveal>
            <Reveal direction="right" delay={0.16}>
              <p className="max-w-[62ch] font-hanken text-base leading-[1.75] small:text-lg">
                Për ne, kujdesi ndaj natyrës nuk është një detaj. Është pjesë e
                mënyrës si mendojmë për mirëqenien sot dhe për botën që lëmë
                pas.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="content-container py-20 small:py-32">
        <div className="grid grid-cols-1 gap-12 small:grid-cols-12 small:gap-10">
          <Reveal className="small:col-span-5">
            <h2 className="max-w-[12ch] font-sans text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-balance">
              Çfarë na dallon?
            </h2>
            <p className="mt-6 max-w-[40ch] font-hanken text-base leading-[1.7] small:text-lg">
              Nuk kërkojmë thjesht produkte të bukura. Kërkojmë zgjedhje që kanë
              arsye të jenë pjesë e përditshmërisë suaj.
            </p>
          </Reveal>

          <div className="border-t border-yco-cream-dark small:col-span-7">
            {principles.map((principle, index) => (
              <Reveal
                key={principle.title}
                direction="right"
                delay={Math.min(index * 0.07, 0.21)}
              >
                <div className="grid grid-cols-1 gap-3 border-b border-yco-cream-dark py-7 small:grid-cols-5 small:gap-6 small:py-8">
                  <h3 className="font-sans text-xl font-semibold leading-tight small:col-span-2">
                    {principle.title}
                  </h3>
                  <p className="font-hanken text-base leading-[1.65] small:col-span-3">
                    {principle.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-yco-cream-dark bg-pastel-blue-soft/60">
        <div className="content-container py-20 text-center small:py-28">
          <Reveal className="mx-auto max-w-4xl">
            <p className="font-sans text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-balance">
              Zgjedhje të mira për ritualet e tua të përditshme.
            </p>
            <LocalizedClientLink
              href="/store"
              className="yco-btn yco-btn--ink mt-9 inline-flex min-h-11 items-center gap-2 px-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2"
            >
              Shfleto përzgjedhjen
              <ArrowRightMini />
            </LocalizedClientLink>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
