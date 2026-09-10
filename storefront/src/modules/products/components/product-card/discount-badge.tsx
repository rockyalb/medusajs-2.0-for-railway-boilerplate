import styles from "./discount-badge.module.css"

export default function DiscountBadge({ percentage, gallery = false }: {
  percentage: string
  gallery?: boolean
}) {
  return (
    <span
      className={`${styles.badge}${gallery ? ` ${styles.galleryBadge}` : ""}`}
      aria-label={`${percentage}% zbritje`}
    >
      <span className={styles.label}>-{percentage}%</span>
    </span>
  )
}
