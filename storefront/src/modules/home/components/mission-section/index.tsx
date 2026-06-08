import Link from "next/link"

export default function MissionSection() {
  return (
    <section className="bg-white px-6 py-14 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
        <div className="overflow-hidden rounded-large bg-yco-panel">
          <img
            src="/placeholder-images/yco-real/mission.jpg"
            alt="YCO clean beauty lifestyle photography"
            className="h-full min-h-[420px] w-full object-cover"
          />
        </div>

        <div className="text-left">
          <p className="rhode-eyebrow mb-4">Our philosophy</p>
          <h2 className="font-sans text-yco-charcoal text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-[-0.02em]">
            good for you, good for the planet.
          </h2>
          <p className="mt-5 max-w-xl font-sans text-yco-charcoal-muted text-base leading-relaxed">
            We believe what you put on your body matters as much as what you put
            in it. Every brand we carry is hand-selected for clean, high-performance
            formulas and packaging that respects the planet.
          </p>
          <div className="mt-7">
            <Link href="/store" className="rhode-pill">
              Shop YCO
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
