const values = [
  {
    title: "100% Certified Organic",
    desc: "Every product meets rigorous international organic certification standards.",
  },
  {
    title: "Zero-Waste Packaging",
    desc: "Plastic-free, compostable, or reusable — from shelf to your doorstep.",
  },
  {
    title: "Cruelty-Free & Vegan",
    desc: "All brands we carry are committed to cruelty-free testing and vegan formulas.",
  },
  {
    title: "Premium, Curated Brands",
    desc: "We hand-select every brand based on ethics, efficacy, and sustainability.",
  },
]

const LeafCheck = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5">
    <path d="M9 2C9 2 4 4.5 4 9a5 5 0 0 0 10 0c0-4.5-5-7-5-7Z" fill="var(--color-yco-green)" className="fill-yco-green" opacity="0.25" />
    <path d="M9 2C9 2 4 4.5 4 9a5 5 0 0 0 10 0c0-4.5-5-7-5-7Z" stroke="var(--color-yco-green)" className="stroke-yco-green" strokeWidth="1.2" fill="none" />
    <path d="M6.5 9l1.5 1.5 3-3" stroke="var(--color-yco-charcoal)" className="stroke-yco-charcoal" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function MissionSection() {
  return (
    <section className="bg-yco-cream py-24 px-6 border-t border-yco-cream-dark">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* Left — editorial quote */}
        <div>
          <div className="w-10 h-px bg-yco-green mb-10" />
          <blockquote className="font-serif text-yco-charcoal text-3xl md:text-4xl lg:text-[2.6rem] leading-[1.25] italic">
            "We believe what you put{" "}
            <em className="not-italic text-yco-coral">on</em> your body is just
            as important as what you put{" "}
            <em className="not-italic text-yco-coral">in</em> it."
          </blockquote>
          <div className="mt-10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yco-cream-dark flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--color-yco-green)" className="stroke-yco-green" strokeWidth="1.3" strokeLinecap="round">
                <path d="M9 2C9 2 4 4.5 4 9a5 5 0 0 0 10 0c0-4.5-5-7-5-7Z" />
              </svg>
            </div>
            <div>
              <div className="font-serif text-yco-charcoal text-sm font-medium">YCO Organics</div>
              <div className="font-sans text-yco-charcoal-muted text-xs tracking-wide mt-0.5">Our founding mission</div>
            </div>
          </div>
        </div>

        {/* Right — values list */}
        <div>
          <span className="font-sans text-yco-green text-xs tracking-[0.3em] uppercase font-medium">Our Standards</span>
          <h3 className="font-serif text-yco-charcoal text-2xl md:text-3xl mt-3 mb-10 leading-snug">
            Why we do things differently
          </h3>
          <div className="space-y-7">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 items-start group">
                <LeafCheck />
                <div>
                  <div className="font-sans text-yco-charcoal text-sm font-semibold mb-1 group-hover:text-yco-coral transition-colors">
                    {v.title}
                  </div>
                  <div className="font-sans text-yco-charcoal-muted text-sm leading-relaxed">
                    {v.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
