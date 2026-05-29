const reviews = [
  {
    name: "Amelia R.",
    location: "London, UK",
    rating: 5,
    text: "I've searched for a one-stop shop for truly natural products for years. YCO is exactly that — every product has been phenomenal, and the packaging is completely plastic-free.",
    product: "UpCircle Eye Cream",
  },
  {
    name: "Sofia M.",
    location: "Berlin, DE",
    rating: 5,
    text: "The Davines ALCHEMIC range transformed my hair. I love knowing every product is certified and the brand actually cares about the planet.",
    product: "Davines ALCHEMIC Series",
  },
  {
    name: "Lea T.",
    location: "Paris, FR",
    rating: 5,
    text: "Switched to Bambaw's zero-waste essentials six months ago and haven't looked back. The quality is outstanding and I feel good about every purchase.",
    product: "Bambaw Zero-Waste Set",
  },
]

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: count }).map((_, i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        className="text-yco-charcoal"
      >
        <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10l-3.6 1.9.7-4L1.2 5.2l4-.6L7 1Z" />
      </svg>
    ))}
  </div>
)

export default function Testimonials() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="rhode-display text-4xl md:text-5xl">yco + you</h2>
            <div className="mt-5 overflow-hidden rounded-large bg-yco-panel md:hidden">
              <img
                src="/placeholder-images/yco-real/community.jpg"
                alt="YCO community lifestyle photography"
                className="h-36 w-full object-cover"
              />
            </div>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rhode-pill self-start sm:self-auto"
          >
            Find us on social
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="flex flex-col gap-5 rounded-large bg-yco-panel p-8"
            >
              <img
                src="/placeholder-images/yco-real/community.jpg"
                alt={`${review.name} customer lifestyle photography`}
                className="h-28 w-full rounded-rounded object-cover"
              />
              <Stars count={review.rating} />
              <blockquote className="flex-1 font-sans text-yco-charcoal text-sm leading-[1.8]">
                “{review.text}”
              </blockquote>
              <div className="flex items-center justify-between border-t border-yco-cream-dark pt-5">
                <div>
                  <div className="font-sans text-yco-charcoal text-sm font-bold">
                    {review.name}
                  </div>
                  <div className="font-sans text-yco-charcoal-muted text-xs mt-0.5">
                    {review.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-sans text-yco-charcoal-muted text-[10px] uppercase tracking-[0.12em]">
                    Purchased
                  </div>
                  <div className="font-sans text-yco-charcoal text-[11px] font-bold mt-0.5 leading-tight">
                    {review.product}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <Stars count={5} />
          <span className="font-sans text-yco-charcoal text-sm font-bold">
            4.9/5
          </span>
          <span className="font-sans text-yco-charcoal-muted text-sm">
            from over 2,000 verified customers
          </span>
        </div>
      </div>
    </section>
  )
}
