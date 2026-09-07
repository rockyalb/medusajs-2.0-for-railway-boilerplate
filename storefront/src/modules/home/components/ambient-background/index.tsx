/** Fixed full-viewport backdrop using the logo's pastel palette. Keeping this
    layer static prevents compositing seams while a long catalog is scrolled. */
export default function AmbientBackground() {
  return (
    <div className="yco-ambient" aria-hidden>
      <div className="yco-ambient__aurora" />
      <div className="yco-ambient__blob yco-ambient__blob--mint" />
      <div className="yco-ambient__blob yco-ambient__blob--rose" />
      <div className="yco-ambient__blob yco-ambient__blob--blue" />
    </div>
  )
}
