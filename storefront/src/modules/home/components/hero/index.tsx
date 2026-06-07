import Link from "next/link"

export default function Hero() {
  return (
    <section className="bs-rhode-hero bs-rhode-hero--rose">
      <div className="bs-rhode-hero__stage">
        <div className="bs-rhode-hero__image-wrap">
          <img
            src="https://bucket-production-a1707.up.railway.app/medusa-media/static/yco-hero-davines-shampoo-01.jpg"
            alt="Davines shampoo bottles on a light surface"
            className="bs-rhode-hero__image"
          />
        </div>

        <div className="bs-rhode-hero__copy">
          <p>{"MIRË PËR JU, MIRË PËR PLANETIN."}</p>
          <h1>{"Shtëpia e produkteve zero-waste, organike dhe natyrale."}</h1>
          <Link href="/store">Shiko produktet</Link>
        </div>
      </div>
    </section>
  )
}
