/** Fixed full-viewport backdrop: a slowly panning pastel aurora and a few
    drifting gradient blobs in the logo palette.

    Seam note: the earlier version blurred huge solid discs with
    `filter: blur()` inside this fixed layer. Blurred layers are rasterised in
    GPU tiles that lack neighbour data at their edges, so while scrolling the
    tiles showed as faint horizontal lines. The blobs are now soft radial
    gradients (no filter at all) and everything animates with `transform`
    only, which stays on the compositor and never re-rasterises. */
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
