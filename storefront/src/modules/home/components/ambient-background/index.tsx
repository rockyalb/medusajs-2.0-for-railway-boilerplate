import Sparkles, { type Spark } from "./sparkles"

/* Sparks are hardcoded (not randomised) so server and client markup match.
   Kept sparse: the layer sits behind translucent sections, so only a few
   larger, tinted stars are needed to read through them. */
const AMBIENT_SPARKS: Spark[] = [
  { top: "9%", left: "10%", size: 28, dur: 6.2, delay: 0.4, color: "#ffffff", glow: "#7CA4EB", float: 11, dy: -10 },
  { top: "18%", left: "82%", size: 20, dur: 7.4, delay: 1.8, color: "#FEE2E0", glow: "#FC8C84", float: 13, dy: -8 },
  { top: "31%", left: "40%", size: 16, dur: 8.1, delay: 3.1, color: "#ffffff", glow: "#84C3AC", float: 12, dy: -6 },
  { top: "44%", left: "92%", size: 26, dur: 6.8, delay: 0.9, color: "#DEE8FA", glow: "#7CA4EB", float: 14, dy: -9 },
  { top: "52%", left: "5%", size: 18, dur: 7.9, delay: 2.4, color: "#ffffff", glow: "#FC8C84", float: 10, dy: -7 },
  { top: "63%", left: "63%", size: 34, dur: 6.5, delay: 4.2, color: "#ffffff", glow: "#84C3AC", float: 15, dy: -12 },
  { top: "76%", left: "24%", size: 24, dur: 8.6, delay: 1.2, color: "#E0F0EA", glow: "#84C3AC", float: 12, dy: -8 },
  { top: "84%", left: "86%", size: 16, dur: 7.2, delay: 3.6, color: "#ffffff", glow: "#FC8C84", float: 11, dy: -6 },
  { top: "91%", left: "48%", size: 20, dur: 6.9, delay: 0.2, color: "#ffffff", glow: "#7CA4EB", float: 13, dy: -9 },
]

/** Fixed full-viewport backdrop: a slowly panning pastel aurora, drifting
    gradient blobs and a few twinkling stars in the logo palette.

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
      <Sparkles sparks={AMBIENT_SPARKS} />
    </div>
  )
}
