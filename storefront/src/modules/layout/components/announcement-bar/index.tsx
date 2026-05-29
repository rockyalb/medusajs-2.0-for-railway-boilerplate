"use client"

import { useState } from "react"

const messages = [
  "Complimentary delivery on orders over €50",
  "New daily essentials now in store",
  "Plastic-free, planet-friendly packaging",
  "Certified organic, cruelty-free brands",
]

export default function AnnouncementBar() {
  const [paused, setPaused] = useState(false)

  // Duplicate the message set so the -50% translate loops seamlessly.
  const loop = [...messages, ...messages]

  return (
    <div className="relative flex items-center bg-yco-panel">
      <div className="flex-1 overflow-hidden">
        <div
          className="rhode-marquee__track flex w-max items-center"
          data-paused={paused}
        >
          {loop.map((message, i) => (
            <span
              key={i}
              className="flex items-center font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-yco-charcoal-muted"
            >
              <span className="px-8 py-2.5">{message}</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play announcements" : "Pause announcements"}
        className="absolute right-3 grid h-6 w-6 place-items-center text-yco-charcoal-muted hover:text-yco-charcoal transition-colors"
      >
        {paused ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 1.5l8 4.5-8 4.5z" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="1.5" width="2.6" height="9" />
            <rect x="7.4" y="1.5" width="2.6" height="9" />
          </svg>
        )}
      </button>
    </div>
  )
}
