import type { CSSProperties } from "react"

export type Spark = {
  top: string
  left: string
  /** Width/height in px. */
  size: number
  /** Twinkle loop duration in seconds. */
  dur: number
  /** Twinkle start offset in seconds. */
  delay: number
  color: string
  /** Peak opacity mid-twinkle (0–1). */
  peak?: number
}

/** Layer of four-point stars that twinkle on a CSS loop. Positioning
    context comes from the parent, which must be relative/fixed/absolute. */
export default function Sparkles({ sparks }: { sparks: Spark[] }) {
  return (
    <>
      {sparks.map((spark, index) => (
        <svg
          key={index}
          className="yco-spark"
          style={
            {
              top: spark.top,
              left: spark.left,
              width: spark.size,
              height: spark.size,
              "--spark-dur": `${spark.dur}s`,
              "--spark-delay": `${spark.delay}s`,
              "--spark-color": spark.color,
              "--spark-peak": spark.peak ?? 0.9,
            } as CSSProperties
          }
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12 7.5-1.8 11.1-5.4 12-12Z" />
        </svg>
      ))}
    </>
  )
}
