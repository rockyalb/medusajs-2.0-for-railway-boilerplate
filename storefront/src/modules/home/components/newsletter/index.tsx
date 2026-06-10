"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const reducedMotion = useReducedMotion()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section className="bg-white px-3 pb-4 small:px-7 small:pb-6">
      <div className="relative overflow-hidden rounded-rounded bg-yco-coral px-6 py-16 text-white small:py-24">
        {/* Oversized watermark wordmark for depth, clipped by the panel. */}
        <span
          aria-hidden
          className="rhode-display pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap !text-white/[0.06] text-[26vw] small:-bottom-24 small:text-[18rem]"
        >
          yco
        </span>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.85, ease: EASE_OUT }}
          className="relative mx-auto max-w-2xl text-center"
        >
          <span className="rhode-eyebrow inline-flex items-center gap-2 !text-white/70">
            <span className="yco-accent-dot" aria-hidden />
            Community
          </span>

          <h2 className="rhode-display mt-4 !text-white text-4xl md:text-5xl">
            join the conscious community
          </h2>

          <p className="mx-auto mt-5 max-w-md font-sans text-sm leading-relaxed text-white/80">
            Get early access to new arrivals, exclusive offers, and our monthly
            guide to sustainable living — straight to your inbox.
          </p>

          {submitted ? (
            <div
              className="mt-9 flex items-center justify-center gap-3 py-4"
              role="status"
            >
              <span className="grid h-8 w-8 place-items-center rounded-circle bg-white/15">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M2 7l3.5 3.5 6.5-6.5" />
                </svg>
              </span>
              <span className="font-sans text-sm font-medium">
                You&apos;re in! Welcome to the YCO community.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="min-h-[48px] flex-1 rounded-circle border border-white/20 bg-white px-6 font-sans text-sm text-yco-charcoal placeholder:text-yco-charcoal-muted/70 outline-none transition focus:ring-2 focus:ring-white/60"
              />
              <button type="submit" className="yco-btn yco-btn--coral">
                Subscribe
              </button>
            </form>
          )}

          <p className="mt-5 font-sans text-[11px] tracking-wide text-white/60">
            No spam, ever. Unsubscribe at any time.
          </p>

          <div className="mt-12 flex items-center justify-center gap-6 border-t border-white/15 pt-9">
            <span className="font-sans text-xs uppercase tracking-widest text-white/60">
              Follow us
            </span>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white/80 transition-colors duration-300 hover:text-white active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white/80 transition-colors duration-300 hover:text-white active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-white/80 transition-colors duration-300 hover:text-white active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
