"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./discount-badge.module.css"

export default function DiscountBadge({ percentage, gallery = false }: {
  percentage: string
  gallery?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let visible = false
    const update = () => setRunning(visible && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    })
    if (ref.current) observer.observe(ref.current)
    document.addEventListener("visibilitychange", update)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", update)
    }
  }, [])

  return (
    <span
      ref={ref}
      className={`${styles.badge}${gallery ? ` ${styles.galleryBadge}` : ""}`}
      data-running={running}
      role="img"
      aria-label={`${percentage}% zbritje`}
    >
      <span className={styles.shell} aria-hidden="true">
        <span className={styles.rotor}>
          <span className={styles.discount}>-{percentage}%</span>
          <span className={styles.offer}>OFERTE</span>
        </span>
      </span>
      <span className={`${styles.bubble} ${styles.bubbleOne}`} aria-hidden="true" />
      <span className={`${styles.bubble} ${styles.bubbleTwo}`} aria-hidden="true" />
      <span className={`${styles.bubble} ${styles.bubbleThree}`} aria-hidden="true" />
    </span>
  )
}
