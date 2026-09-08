"use client"

import { useEffect, useState } from "react"
import { clx } from "@medusajs/ui"
import {
  DEFAULT_BRAND_FONT,
  DEFAULT_HEADING_FONT,
  DEFAULT_UI_FONT,
  FONT_LAB_STORAGE_KEY,
  FONT_OPTIONS,
  type FontOption,
} from "@lib/font-lab-options"

type Slot = "heading" | "brand" | "ui"

type Selection = {
  heading: string
  brand: string
  ui: string
  linked: boolean
}

const DEFAULT_SELECTION: Selection = {
  heading: DEFAULT_HEADING_FONT,
  brand: DEFAULT_BRAND_FONT,
  ui: DEFAULT_UI_FONT,
  linked: false,
}

const SAMPLE = "Kujdes i pastër, i ri & organik — Ëç 0123"

function optionById(id: string): FontOption | undefined {
  return FONT_OPTIONS.find((option) => option.id === id)
}

/* Tailwind's `display`/`serif` families read `--font-heading` (falls back to
   Baloo 2), `sans` reads `--font-brand` and `hanken` reads `--font-ui` (both
   fall back to Comfortaa), so pointing these three variables at another loaded
   face restyles the whole page. A slot left on its default writes nothing, so
   the shipped pairing stays in force. */
function applySelection(selection: Selection) {
  const root = document.documentElement

  const slots: [string, FontOption | undefined, string][] = [
    ["--font-heading", optionById(selection.heading), DEFAULT_HEADING_FONT],
    ["--font-brand", optionById(selection.brand), DEFAULT_BRAND_FONT],
    [
      "--font-ui",
      optionById(selection.linked ? selection.brand : selection.ui),
      DEFAULT_UI_FONT,
    ],
  ]

  for (const [cssVar, option, defaultId] of slots) {
    if (option && option.id !== defaultId) {
      root.style.setProperty(cssVar, `var(${option.cssVar})`)
    } else {
      root.style.removeProperty(cssVar)
    }
  }
}

function readStored(): Selection {
  try {
    const raw = window.localStorage.getItem(FONT_LAB_STORAGE_KEY)
    if (!raw) return DEFAULT_SELECTION
    const parsed = JSON.parse(raw) as Partial<Selection>
    return {
      heading: optionById(parsed.heading ?? "")
        ? parsed.heading!
        : DEFAULT_HEADING_FONT,
      brand: optionById(parsed.brand ?? "") ? parsed.brand! : DEFAULT_BRAND_FONT,
      ui: optionById(parsed.ui ?? "") ? parsed.ui! : DEFAULT_UI_FONT,
      linked: Boolean(parsed.linked),
    }
  } catch {
    return DEFAULT_SELECTION
  }
}

/** Floating tool for comparing typefaces on the live pages. Opt-in: the root
 * layout renders it only when `NEXT_PUBLIC_FONT_LAB=true`, so it is off in
 * production. The choice persists per browser via localStorage and never
 * touches the server-rendered markup, so it is safe on a preview deploy. */
export default function FontLab() {
  const [open, setOpen] = useState(false)
  const [slot, setSlot] = useState<Slot>("brand")
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readStored()
    setSelection(stored)
    applySelection(stored)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    applySelection(selection)
    try {
      window.localStorage.setItem(
        FONT_LAB_STORAGE_KEY,
        JSON.stringify(selection)
      )
    } catch {
      /* Private mode or blocked storage: the choice still applies for this page. */
    }
  }, [selection, ready])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const activeId = selection[slot]
  const headingLabel = optionById(selection.heading)?.label ?? "—"
  const brandLabel = optionById(selection.brand)?.label ?? "—"
  const uiLabel =
    optionById(selection.linked ? selection.brand : selection.ui)?.label ?? "—"
  const isDefault =
    selection.heading === DEFAULT_HEADING_FONT &&
    selection.brand === DEFAULT_BRAND_FONT &&
    selection.ui === DEFAULT_UI_FONT &&
    !selection.linked

  const choose = (id: string) => {
    setSelection((current) => ({ ...current, [slot]: id }))
  }

  return (
    <div className="yco-font-lab" data-open={open ? "true" : "false"}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="yco-font-lab-panel"
        aria-label={open ? "Close font lab" : "Open font lab"}
        className="yco-font-lab__fab"
      >
        <span aria-hidden className="yco-font-lab__glyph">
          Aa
        </span>
        {!isDefault && <span aria-hidden className="yco-font-lab__dot" />}
      </button>

      <div
        id="yco-font-lab-panel"
        role="dialog"
        aria-label="Font lab"
        hidden={!open}
        className="yco-font-lab__panel"
      >
        <div className="yco-font-lab__head">
          <div>
            <p className="yco-font-lab__title">Font lab</p>
            <p className="yco-font-lab__sub">
              Headings: <b>{headingLabel}</b> · Body: <b>{brandLabel}</b> ·
              Nav/UI: <b>{uiLabel}</b>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelection(DEFAULT_SELECTION)}
            disabled={isDefault}
            className="yco-font-lab__reset"
          >
            Reset
          </button>
        </div>

        <div className="yco-font-lab__tabs" role="tablist" aria-label="Font slot">
          <button
            type="button"
            role="tab"
            aria-selected={slot === "heading"}
            onClick={() => setSlot("heading")}
            className="yco-font-lab__tab"
          >
            Headings
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={slot === "brand"}
            onClick={() => setSlot("brand")}
            className="yco-font-lab__tab"
          >
            Body
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={slot === "ui"}
            onClick={() => setSlot("ui")}
            disabled={selection.linked}
            className="yco-font-lab__tab"
          >
            Nav / UI
          </button>
        </div>

        <label className="yco-font-lab__link">
          <input
            type="checkbox"
            checked={selection.linked}
            onChange={(event) =>
              setSelection((current) => ({
                ...current,
                linked: event.target.checked,
              }))
            }
          />
          Use the body font for nav/UI too
        </label>

        <ul className="yco-font-lab__list" role="listbox" aria-label="Typefaces">
          {FONT_OPTIONS.map((option) => {
            const active = option.id === activeId
            return (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(option.id)}
                  className={clx("yco-font-lab__option", active && "is-active")}
                  style={{ fontFamily: `var(${option.cssVar})` }}
                >
                  <span className="yco-font-lab__name">{option.label}</span>
                  <span className="yco-font-lab__sample">{SAMPLE}</span>
                  <span className="yco-font-lab__note">{option.note}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
