import Link from "next/link"

export default function Hero() {
  return (
    <section className="bs-rhode-hero bs-rhode-hero--rose">
      <div className="bs-rhode-hero__stage">
        <div className="bs-rhode-hero__image-wrap">
          <img
            src="/placeholder-images/yco-real/hero.jpg"
            alt="YCO product ritual photography"
            className="bs-rhode-hero__image"
          />
        </div>

        <div className="bs-rhode-hero__copy">
          <h1>a soft reset for skin, lips, and every day.</h1>
          <Link href="/store">shop the edit</Link>
        </div>
      </div>
    </section>
  )
}
