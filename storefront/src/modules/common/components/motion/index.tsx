"use client"

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react"

/* Shared scroll-entrance primitives for the storefront. Every component
   degrades to a static render when the visitor prefers reduced motion. */

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT, delay },
  }),
}

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number
  /** How much of the element must be visible before it animates in. */
  amount?: number
}

/** Fade-and-rise entrance, triggered once when scrolled into view. */
export function Reveal({ delay = 0, amount = 0.25, ...props }: RevealProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    const { initial, whileInView, viewport, variants, custom, ...rest } = props
    return <motion.div {...rest} />
  }

  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      custom={delay}
      {...props}
    />
  )
}

const staggerParent: Variants = {
  hidden: {},
  visible: (stagger: number = 0.08) => ({
    transition: { staggerChildren: stagger },
  }),
}

type StaggerProps = HTMLMotionProps<"div"> & {
  stagger?: number
  amount?: number
}

/** Parent container that staggers its <StaggerItem> children into view. */
export function Stagger({ stagger = 0.08, amount = 0.2, ...props }: StaggerProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    const { initial, whileInView, viewport, variants, custom, ...rest } = props
    return <motion.div {...rest} />
  }

  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      custom={stagger}
      {...props}
    />
  )
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    const { variants, ...rest } = props
    return <motion.div {...rest} />
  }

  return <motion.div variants={staggerItem} {...props} />
}
