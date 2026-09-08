"use client"

import { useState } from "react"

const messages = [
  "Transport falas për porosi mbi 8,000 ALL",
  "Produkte të reja për kujdesin e përditshëm",
  "Paketim pa plastikë dhe miqësor me mjedisin",
  "Brende organike, pa testim te kafshët",
]

export default function AnnouncementBar() {
  const [paused, setPaused] = useState(false)

  // Duplicate the message set so the -50% translate loops seamlessly.
  const loop = [...messages, ...messages]

  return (
    <div className="relative flex items-center bg-yco-panel">
      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          className="rhode-marquee__track flex w-max items-center"
          data-paused={paused}
        >
          {loop.map((message, i) => (
            <span
              key={i}
              className="flex items-center font-sans text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-yco-charcoal-muted"
            >
              <span className="px-8 py-[5px]">{message}</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Luaj njoftimet" : "Ndalo njoftimet"}
        className="absolute right-3 grid h-5 w-5 place-items-center text-yco-charcoal-muted hover:text-yco-charcoal transition-colors"
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
