import Sparkles, { type Spark } from "./sparkles"

/* Sparks are hardcoded (not randomised) so server and client markup match. */
const AMBIENT_SPARKS: Spark[] = [
  { top: "8%", left: "12%", size: 14, dur: 5.2, delay: 0.4, color: "#ffffff" },
  { top: "16%", left: "78%", size: 10, dur: 6.4, delay: 1.8, color: "#f3c4bb" },
  { top: "27%", left: "38%", size: 8, dur: 7.1, delay: 3.1, color: "#ffffff" },
  { top: "34%", left: "90%", size: 12, dur: 5.8, delay: 0.9, color: "#b9cff5" },
  { top: "46%", left: "6%", size: 11, dur: 6.9, delay: 2.4, color: "#ffffff" },
  { top: "52%", left: "62%", size: 9, dur: 5.5, delay: 4.2, color: "#b4dcc8" },
  { top: "63%", left: "24%", size: 13, dur: 7.6, delay: 1.2, color: "#ffffff" },
  { top: "70%", left: "84%", size: 8, dur: 6.2, delay: 3.6, color: "#f3c4bb" },
  { top: "78%", left: "48%", size: 10, dur: 5.9, delay: 0.2, color: "#ffffff" },
  { top: "86%", left: "10%", size: 9, dur: 6.7, delay: 2.9, color: "#b9cff5" },
  { top: "90%", left: "70%", size: 12, dur: 7.3, delay: 1.6, color: "#ffffff" },
  { top: "12%", left: "52%", size: 7, dur: 6.1, delay: 5.0, color: "#b4dcc8" },
]

/** Fixed full-viewport backdrop: drifting pastel blobs plus twinkling
    sparks in the logo palette. Renders behind translucent home sections. */
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
