"use client"

import { useState } from "react"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section className="bg-yco-green py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">

        {/* Botanical accent */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-12 bg-yco-cream/30" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-4">
            <path d="M12 3C12 3 7 5.5 7 10a5 5 0 0 0 10 0c0-4.5-5-7-5-7Z" fill="var(--color-yco-cream)" className="fill-yco-cream" opacity="0.6" />
            <path d="M12 10v9" stroke="var(--color-yco-cream)" className="stroke-yco-cream" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <div className="h-px w-12 bg-yco-cream/30" />
        </div>

        <span className="font-sans text-yco-cream text-xs tracking-[0.3em] uppercase font-medium">Community</span>

        <h2 className="font-serif text-yco-charcoal text-4xl md:text-5xl mt-4 mb-5 leading-tight">
          Join the Conscious<br />
          <em className="italic text-yco-coral not-italic">Community</em>
        </h2>

        <p className="font-sans text-yco-charcoal-muted text-sm leading-relaxed mb-10 max-w-md mx-auto">
          Get early access to new arrivals, exclusive offers, and our monthly guide to sustainable living — straight to your inbox.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-8 h-8 rounded-full bg-yco-cream/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--color-yco-cream)" className="stroke-yco-cream" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7l3.5 3.5 6.5-6.5" />
              </svg>
            </div>
            <span className="font-sans text-yco-cream text-sm font-medium">You&apos;re in! Welcome to the YCO community.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-yco-cream text-yco-charcoal placeholder-yco-charcoal-muted/60 font-sans text-sm px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-yco-blue/50 transition border border-yco-cream-dark/50"
            />
            <button
              type="submit"
              className="bg-yco-coral text-yco-cream font-sans text-xs tracking-[0.2em] uppercase font-medium px-8 py-4 rounded-xl hover:bg-yco-coral/90 active:scale-95 transition-all duration-300 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="font-sans text-yco-charcoal-muted text-[11px] mt-5 tracking-wide">
          No spam, ever. Unsubscribe at any time.
        </p>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6 mt-14 pt-10 border-t border-yco-cream/20">
          <span className="font-sans text-yco-charcoal-muted text-xs tracking-widest uppercase">Follow us</span>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
            className="text-yco-cream hover:text-yco-coral transition-colors duration-300 active:scale-95 inline-block animate-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
            className="text-yco-cream hover:text-yco-coral transition-colors duration-300 active:scale-95 inline-block animate-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
            className="text-yco-cream hover:text-yco-coral transition-colors duration-300 active:scale-95 inline-block animate-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}
