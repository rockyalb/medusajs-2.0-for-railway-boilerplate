import { hankenGrotesk } from "@lib/fonts"
import styles from "./discount-badge.module.css"

export default function DiscountBadge({ percentage, gallery = false }: {
  percentage: string
  gallery?: boolean
}) {
  return (
    <span
      className={`${hankenGrotesk.variable} ${styles.badge}${gallery ? ` ${styles.galleryBadge}` : ""}`}
      role="img"
      aria-label={`${percentage}% zbritje`}
    >
      <span aria-hidden="true">-{percentage}%</span>
    </span>
  )
}
