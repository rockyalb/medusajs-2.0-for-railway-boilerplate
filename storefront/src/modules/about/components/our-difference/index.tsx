"use client"

import { ArrowRightMini } from "@medusajs/icons"
import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { ReactNode } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EASE = [0.22, 1, 0.36, 1] as const

/* Photography is self-hosted under /public/images/diferenca, both shot by
   others and released under the Unsplash License (free commercial use, no
   attribution required — credited here anyway):
   · paketim-pa-plastike.webp — Woola Packaging, unsplash.com/photos/m-meHZ7tcOE
   · ritual-produkti.webp     — @wowcontly,      unsplash.com/photos/5TOxn3yB7K0 */

/* The page argues from absence: what YCO leaves out is the difference. These
   are the exclusions printed on the formulas, kept in the order a label reads
   them — surfactants, scent, then the polymers and animal-derived inputs. */
const excluded = [
  "Sulfate",
  "Aromë e shtuar",
  "Mikroplastikë",
  "PMMA",
  "Gluten",
  "Dyllë blete",
  "Yndyrë shtazore",
  "Testime mbi kafshë",
]

const standards = [
  {
    term: "Standarde evropiane",
    detail:
      "Prodhuar sipas standardeve evropiane, me formulat më të fundit të disponueshme.",
  },
  {
    term: "Përbërës të zgjedhur",
    detail:
      "Çdo përbërës hyn për cilësinë, efikasitetin dhe origjinën e tij — jo për efektin në etiketë.",
  },
  {
    term: "Doza që kanë kuptim",
    detail:
      "Përbërësit vijnë në doza që bëjnë punë reale për lëkurën, jo në sasi simbolike.",
  },
  {
    term: "Vegane, pa përjashtim",
    detail: "Pa dyllë blete, pa yndyrë shtazore, pa testime mbi kafshë.",
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

/* Particulate suspended in the fill below — hand-placed so the scatter reads as
   contamination rather than as a pattern. Percentages are of the water block. */
const motes = [
  { x: 14, y: 22, r: 5 },
  { x: 31, y: 46, r: 3 },
  { x: 52, y: 17, r: 4 },
  { x: 73, y: 34, r: 6 },
  { x: 88, y: 58, r: 3 },
  { x: 22, y: 68, r: 4 },
  { x: 44, y: 79, r: 5 },
  { x: 63, y: 62, r: 3 },
  { x: 80, y: 86, r: 4 },
  { x: 9, y: 88, r: 3 },
  { x: 37, y: 31, r: 3 },
  { x: 68, y: 92, r: 4 },
]

/* The one loud moment on the page: 83% of the world's water carries
   microplastic. The figure is drawn rather than stated — the tint fills to
   exactly 83% of the panel and the waterline crosses the numeral itself. */
function WaterFill() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative isolate aspect-[4/5] w-full overflow-hidden rounded-large border border-yco-cream-dark bg-white">
      <motion.div
        className="absolute inset-x-0 bottom-0 bg-pastel-blue-soft"
        initial={{ height: reducedMotion ? "83%" : "0%" }}
        whileInView={{ height: "83%" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reducedMotion ? 0 : 1.7, ease: EASE }}
        aria-hidden
      >
        <div className="absolute inset-x-0 -top-[15px] h-4 overflow-hidden">
          <motion.svg
            viewBox="0 0 240 16"
            preserveAspectRatio="none"
            className="h-full w-[200%]"
            animate={reducedMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 16, ease: "linear", repeat: Infinity }}
          >
            <path
              d="M0 16 V9 C10 3 20 3 30 9 S50 15 60 9 S80 3 90 9 S110 15 120 9 S140 3 150 9 S170 15 180 9 S200 3 210 9 S230 15 240 9 V16 Z"
              fill="#DEE8FA"
            />
          </motion.svg>
        </div>

        {motes.map((mote) => (
          <span
            key={`${mote.x}-${mote.y}`}
            className="absolute rounded-circle bg-pastel-blue/55"
            style={{
              left: `${mote.x}%`,
              top: `${mote.y}%`,
              height: mote.r,
              width: mote.r,
            }}
          />
        ))}
      </motion.div>

      <p className="absolute inset-x-0 top-[17%] -translate-y-1/2 px-7 text-center">
        <span className="block font-sans text-[clamp(3.25rem,7vw,5.25rem)] font-bold leading-none tracking-[-0.03em] text-pastel-blue-ink">
          83%
        </span>
        <span className="mx-auto mt-5 block max-w-[24ch] font-hanken text-base leading-[1.55] text-yco-charcoal">
          e ujit në botë është i ndotur me mikroplastikë.
        </span>
      </p>
    </div>
  )
}

export default function OurDifference() {
  const reducedMotion = useReducedMotion()

  return (
    <main className="overflow-hidden text-yco-charcoal">
      {/* Hero — the thesis, stated in one line */}
      <section className="border-b border-yco-cream-dark bg-yco-panel/70">
        <div className="content-container py-20 small:py-32">
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="rhode-eyebrow inline-flex items-center gap-2 text-yco-charcoal"
          >
            <span className="yco-accent-dot" aria-hidden />
            Diferenca jonë
          </motion.p>

          <div className="mt-7 grid grid-cols-1 gap-8 small:grid-cols-12 small:items-end small:gap-10">
            <h1 className="rhode-display font-sans text-[clamp(2.25rem,5.4vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.028em] small:col-span-8">
              <span className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={reducedMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
                >
                  Ndryshe që nga
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-2">
                <motion.span
                  className="block text-pastel-mint-ink"
                  initial={reducedMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.17, ease: EASE }}
                >
                  përbërësi i parë.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.32, ease: EASE }}
              className="max-w-[46ch] font-hanken text-base font-medium leading-[1.65] small:col-span-4 small:col-start-9 small:pb-3 small:text-lg"
            >
              Sjellim produkte tërësisht organike, pa përbërës që dëmtojnë
              lëkurën ose planetin. Ndryshimi nuk qëndron në etiketë — qëndron
              në atë që ka, dhe në atë që s&apos;ka, brenda shishes.
            </motion.p>
          </div>
        </div>
      </section>

      {/* What we removed — the exclusions, struck off the way a label would */}
      <section className="content-container py-20 small:py-32">
        <div className="grid grid-cols-1 gap-12 small:grid-cols-12 small:gap-10">
          <Reveal className="small:col-span-5">
            <h2 className="max-w-[13ch] font-sans text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-balance">
              E nisëm nga ajo që hoqëm.
            </h2>
            <p className="mt-6 max-w-[40ch] font-hanken text-base leading-[1.7] small:text-lg">
              Përpara se të vendosim çfarë duhet të ketë një formulë, vendosim
              çfarë nuk do të ketë kurrë. Kjo listë nuk lëviz.
            </p>
          </Reveal>

          <div className="small:col-span-6 small:col-start-7">
            <p className="rhode-eyebrow border-b border-yco-cream-dark pb-4">
              Nuk hyn në formulë
            </p>
            <ul className="grid grid-cols-1 xsmall:grid-cols-2">
              {excluded.map((item, index) => (
                <li key={item} className="border-b border-yco-cream-dark">
                  <Reveal
                    direction="right"
                    delay={Math.min(index * 0.05, 0.3)}
                    className="py-4"
                  >
                    <span className="font-hanken text-sm font-bold uppercase tracking-[0.14em] text-yco-charcoal-muted line-through decoration-pastel-coral decoration-[1.5px]">
                      {item}
                    </span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-y border-yco-cream-dark bg-pastel-mint-soft/70">
        <div className="content-container py-20 small:py-32">
          <Reveal className="mx-auto max-w-5xl text-center">
            <p className="font-sans text-[clamp(1.85rem,4.4vw,4rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-balance">
              Duke përdorur YCO mbroni veten dhe planetin, sepse synimi ynë nuk
              është vetëm shëndeti ynë.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Say no to plastic. Two claims, two kinds of evidence: the packaging you
          can hold, and the contamination you can't see. */}
      <section className="content-container py-20 small:py-32">
        <Reveal className="grid grid-cols-1 gap-6 small:grid-cols-12 small:items-end small:gap-10">
          <h2 className="max-w-[12ch] font-sans text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-balance small:col-span-6">
            Thuaj jo plastikës.
          </h2>
          <p className="max-w-[46ch] font-hanken text-base leading-[1.7] small:col-span-5 small:col-start-8 small:pb-2 small:text-lg">
            Plastika hyn dy herë: një herë si paketim, një herë si përbërës. Ne i
            mbyllim të dyja rrugët.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-12 small:mt-20 small:grid-cols-2 small:gap-14">
          <Reveal direction="left">
            <div className="relative aspect-[4/5] overflow-hidden rounded-large border border-yco-cream-dark">
              <Image
                src="/images/diferenca/paketim-pa-plastike.webp"
                alt="Produkte kozmetike të vendosura rreth një zarfi prej kartoni të riciklueshëm"
                fill
                sizes="(max-width: 1023px) 100vw, 44vw"
                className="object-cover"
              />
            </div>
            <h3 className="mt-7 font-sans text-xl font-semibold leading-tight">
              Në paketim
            </h3>
            <p className="mt-3 max-w-[46ch] font-hanken text-base leading-[1.7]">
              Zgjedhim vetëm produkte që paketohen me materiale tërësisht të
              riciklueshme. Mbrojtja e planetit prek drejtpërdrejt shëndetin
              tonë.
            </p>
          </Reveal>

          <Reveal direction="right" delay={0.08}>
            <WaterFill />
            <h3 className="mt-7 font-sans text-xl font-semibold leading-tight">
              Në formulë
            </h3>
            <p className="mt-3 max-w-[46ch] font-hanken text-base leading-[1.7]">
              Edhe make-up-i e mban këtë ndotje. Te ne PMMA-ja dhe mikroplastika
              janë të ndaluara — askush nuk dëshiron t&apos;i mbajë përbërës të
              tillë mbi lëkurë.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Standards */}
      <section className="border-t border-yco-cream-dark bg-yco-panel/70">
        <div className="content-container grid grid-cols-1 gap-12 py-20 small:grid-cols-12 small:gap-10 small:py-32">
          <Reveal className="small:col-span-5">
            <h2 className="max-w-[14ch] font-sans text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-balance">
              Aty ku shkenca takon natyrën.
            </h2>
            <p className="mt-6 max-w-[40ch] font-hanken text-base leading-[1.7] small:text-lg">
              Formula ndryshon sepse edhe lëkura ndryshon. Ajo që nuk ndryshon
              është mënyra si ndërtohet.
            </p>
          </Reveal>

          <dl className="border-t border-yco-cream-dark small:col-span-7">
            {standards.map((standard, index) => (
              <Reveal
                key={standard.term}
                direction="right"
                delay={Math.min(index * 0.07, 0.21)}
              >
                <div className="grid grid-cols-1 gap-3 border-b border-yco-cream-dark py-7 small:grid-cols-5 small:gap-6 small:py-8">
                  <dt className="font-sans text-xl font-semibold leading-tight small:col-span-2">
                    {standard.term}
                  </dt>
                  <dd className="font-hanken text-base leading-[1.65] small:col-span-3">
                    {standard.detail}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Close */}
      <section className="border-t border-yco-cream-dark bg-pastel-coral-soft/50">
        <div className="content-container grid grid-cols-1 items-center gap-12 py-20 small:grid-cols-12 small:gap-10 small:py-28">
          <div className="small:col-span-6 small:col-start-7 small:row-start-1">
            <Reveal direction="right">
              <p className="max-w-[16ch] font-sans text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-balance">
                Bukuri e vërtetë, nga produkte të vërteta.
              </p>
              <LocalizedClientLink
                href="/store"
                className="yco-btn yco-btn--ink mt-9 inline-flex min-h-11 items-center gap-2 px-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2"
              >
                Shfleto produktet
                <ArrowRightMini />
              </LocalizedClientLink>
            </Reveal>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-large small:col-span-5 small:col-start-1 small:row-start-1 small:aspect-[4/5]">
            <Image
              src="/images/diferenca/ritual-produkti.webp"
              alt="Një kavanoz dhe një shishe me pikatore mbi një gur graniti, në sfond me tone të ngrohta"
              fill
              sizes="(max-width: 1023px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
