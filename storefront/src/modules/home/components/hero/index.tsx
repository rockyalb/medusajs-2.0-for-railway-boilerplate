import HeroCopy from "./hero-copy"

export default function Hero() {
  return (
    <section className="bs-rhode-hero bs-rhode-hero--rose">
      <div className="bs-rhode-hero__stage">
        <div className="bs-rhode-hero__image-wrap">
          <img
            src="https://bucket-production-a1707.up.railway.app/medusa-media/static/yco-hero-davines-shampoo-01.jpg"
            alt="Davines shampoo bottles on a light surface"
            className="bs-rhode-hero__image"
            fetchPriority="high"
          />
        </div>
        <HeroCopy />
      </div>
    </section>
  )
}
