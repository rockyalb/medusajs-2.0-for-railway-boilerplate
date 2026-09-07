let lockCount = 0
let restore: (() => void) | undefined

// Each overlay owns one lock; closing another overlay cannot unlock the page.
export function lockPageScroll() {
  if (lockCount === 0) {
    const body = document.body
    const root = document.documentElement
    const x = window.scrollX
    const y = window.scrollY
    const saved = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }
    const rootOverflow = root.style.overflow
    const scrollbar = window.innerWidth - root.clientWidth
    const padding = parseFloat(window.getComputedStyle(body).paddingRight) || 0

    Object.assign(body.style, {
      position: "fixed",
      top: `-${y}px`,
      left: `-${x}px`,
      width: "100%",
      overflow: "hidden",
      paddingRight: `${padding + scrollbar}px`,
    })
    root.style.overflow = "hidden"

    restore = () => {
      Object.assign(body.style, saved)
      root.style.overflow = rootOverflow
      const behavior = root.style.scrollBehavior
      root.style.scrollBehavior = "auto"
      window.scrollTo({ left: x, top: y, behavior: "instant" })
      root.style.scrollBehavior = behavior
    }
  }
  lockCount += 1
  let released = false
  return () => {
    if (released) return
    released = true
    lockCount -= 1
    if (lockCount === 0) {
      restore?.()
      restore = undefined
    }
  }
}
