import Link from "next/link"

export default function Hero() {
  return (
    <section className="min-h-[92vh] bg-yco-cream flex flex-col lg:flex-row items-stretch overflow-hidden">
      {/* Left — editorial text panel */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-14 lg:px-16 xl:px-24 py-24 lg:py-0">
        <span
          className="text-yco-green tracking-[0.3em] text-xs uppercase font-sans font-medium mb-8 animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{ animationDelay: "0ms" }}
        >
          Conscious Living
        </span>

        <h1 className="font-serif leading-[1.05] mb-8">
          <span
            className="block text-[clamp(2.8rem,6.5vw,5.5rem)] text-yco-charcoal animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
            style={{ animationDelay: "80ms" }}
          >
            Good
          </span>
          <span
            className="block text-[clamp(2.8rem,6.5vw,5.5rem)] italic text-yco-coral animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
            style={{ animationDelay: "160ms" }}
          >
            for you,
          </span>
          <span
            className="block text-[clamp(2.8rem,6.5vw,5.5rem)] text-yco-charcoal animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
            style={{ animationDelay: "240ms" }}
          >
            good for
          </span>
          <span
            className="block text-[clamp(2.8rem,6.5vw,5.5rem)] italic text-yco-charcoal animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
            style={{ animationDelay: "320ms" }}
          >
            the planet.
          </span>
        </h1>

        <p
          className="font-sans text-yco-charcoal-muted text-base md:text-[17px] max-w-[420px] mb-10 leading-[1.75] animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{ animationDelay: "400ms" }}
        >
          The home of certified organic, zero-waste, and natural products —
          curated for conscious living. Beautiful for you, kind to the Earth.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{ animationDelay: "480ms" }}
        >
          <Link
            href="/store"
            className="bg-yco-blue text-yco-cream px-9 py-4 text-xs tracking-[0.2em] uppercase font-sans font-medium hover:bg-yco-blue/90 active:scale-95 transition-all duration-300 rounded-full inline-flex items-center justify-center gap-3 animate-none"
          >
            Shop Now
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/about"
            className="border border-yco-charcoal text-yco-charcoal px-9 py-4 text-xs tracking-[0.2em] uppercase font-sans font-medium hover:bg-yco-charcoal hover:text-yco-cream active:scale-95 transition-all duration-300 rounded-full inline-flex items-center justify-center animate-none"
          >
            Our Story
          </Link>
        </div>
      </div>

      {/* Right — lifestyle visual panel */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden animate-[fade-up_1.1s_cubic-bezier(0.16,1,0.3,1)_both]"
        style={{ animationDelay: "200ms" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yco-cream-dark via-yco-cream-dark/50 to-yco-cream" />

        {/* Decorative background shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-[40px] border border-yco-green/20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-[30px] border border-yco-blue/15 pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

        {/* Hero image container */}
        <div className="relative z-10 w-[85%] h-[85%] max-w-[480px] max-h-[580px] rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02] border-4 border-yco-cream">
          <img
            src="/yco_hero_bottles.png"
            alt="YCO Organics premium products"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Brand accent dots */}
        <div className="absolute top-1/3 left-8 w-3 h-3 rounded-full bg-yco-coral/30" />
        <div className="absolute bottom-1/3 right-10 w-2.5 h-2.5 rounded-full bg-yco-green/40" />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-yco-blue/30" />
      </div>
    </section>
  )
}
