const reviews = [
  {
    name: "Amelia R.",
    location: "London, UK",
    rating: 5,
    text: "I've been searching for a one-stop shop for truly natural products for years. YCO Organics is exactly that — every product I've tried has been phenomenal, and the packaging is completely plastic-free.",
    product: "UpCircle Eye Cream",
  },
  {
    name: "Sofia M.",
    location: "Berlin, DE",
    rating: 5,
    text: "The Davines ALCHEMIC range transformed my hair. What I love most is knowing every product is certified and the brand actually cares about the planet. Fast shipping, beautiful packaging.",
    product: "Davines ALCHEMIC Series",
  },
  {
    name: "Lea T.",
    location: "Paris, FR",
    rating: 5,
    text: "Switched to Bambaw's zero-waste essentials six months ago and haven't looked back. The quality is outstanding and I feel genuinely good about every purchase I make here.",
    product: "Bambaw Zero-Waste Set",
  },
]

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="var(--color-yco-coral)" className="fill-yco-coral">
        <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1Z" />
      </svg>
    ))}
  </div>
)

export default function Testimonials() {
  return (
    <section className="bg-yco-cream py-24 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <span className="font-sans text-yco-green text-xs tracking-[0.3em] uppercase font-medium">Reviews</span>
          <h2 className="font-serif text-yco-charcoal text-4xl md:text-5xl mt-3">
            Loved by conscious shoppers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-white p-8 rounded-2xl flex flex-col gap-5 hover:-translate-y-1 transition-all duration-300 border border-yco-cream-dark/50"
              style={{ boxShadow: "0 4px 30px rgba(51,51,51,0.03)" }}
            >
              <Stars count={review.rating} />

              <blockquote className="font-sans text-yco-charcoal text-sm leading-[1.8] flex-1">
                "{review.text}"
              </blockquote>

              <div className="pt-5 border-t border-yco-cream-dark flex items-center justify-between">
                <div>
                  <div className="font-serif text-yco-charcoal text-sm font-medium">{review.name}</div>
                  <div className="font-sans text-yco-green text-xs mt-0.5">{review.location}</div>
                </div>
                <div className="text-right">
                  <div className="font-sans text-yco-charcoal-muted text-[10px] tracking-wide uppercase">Purchased</div>
                  <div className="font-sans text-yco-charcoal text-[11px] font-medium mt-0.5 leading-tight">{review.product}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary stat */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 14 14" fill="var(--color-yco-coral)" className="fill-yco-coral">
                <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1Z" />
              </svg>
            ))}
          </div>
          <span className="font-sans text-yco-charcoal text-sm font-medium">4.9/5</span>
          <span className="font-sans text-yco-charcoal-muted text-sm">from over 2,000 verified customers</span>
        </div>

      </div>
    </section>
  )
}
