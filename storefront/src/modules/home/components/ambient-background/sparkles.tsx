import { useId, type CSSProperties } from "react"

export type Spark = {
  top: string
  left: string
  /** Width/height in px. */
  size: number
  /** Twinkle loop duration in seconds. */
  dur: number
  /** Twinkle start offset in seconds. */
  delay: number
  /** Core colour of the star (its centre). */
  color: string
  /** Halo colour; defaults to the core colour. Use a saturated logo tint so a
      white core still reads on the pale wash. */
  glow?: string
  /** Peak opacity mid-twinkle (0–1). */
  peak?: number
  /** Slow float loop duration in seconds. Omit to keep the star pinned. */
  float?: number
  /** Float travel in px. */
  dx?: number
  dy?: number
}

/** Layer of four-point stars that twinkle on a CSS loop and drift very
    slowly. Larger stars get a second, smaller cross rotated 45° so they read
    as a sparkle rather than a dot. Positioning context comes from the parent,
    which must be relative/fixed/absolute. */
export default function Sparkles({ sparks }: { sparks: Spark[] }) {
  const baseId = useId()

  return (
    <>
      {sparks.map((spark, index) => {
        const gradientId = `${baseId}-spark-${index}`
        const glow = spark.glow ?? spark.color
        const sparkle = spark.size >= 16

        return (
          <span
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
                "--spark-glow": glow,
                "--spark-peak": spark.peak ?? 0.95,
                "--spark-float": spark.float ? `${spark.float}s` : "0s",
                "--spark-dx": `${spark.dx ?? 0}px`,
                "--spark-dy": `${spark.dy ?? 0}px`,
              } as CSSProperties
            }
          >
            <svg
              className="yco-spark__star"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <defs>
                <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={spark.color} />
                  <stop offset="45%" stopColor={spark.color} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={glow} stopOpacity="0.85" />
                </radialGradient>
              </defs>
              {sparkle && (
                <path
                  d="M12 5.5c.4 3 2.1 4.7 5.5 5.5-3.4.8-5.1 2.5-5.5 5.5-.4-3-2.1-4.7-5.5-5.5 3.4-.8 5.1-2.5 5.5-5.5Z"
                  fill={glow}
                  opacity="0.55"
                  transform="rotate(45 12 12)"
                />
              )}
              <path
                d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12 7.5-1.8 11.1-5.4 12-12Z"
                fill={`url(#${gradientId})`}
              />
              <circle cx="12" cy="12" r="1.6" fill="#ffffff" opacity="0.9" />
            </svg>
          </span>
        )
      })}
    </>
  )
}
