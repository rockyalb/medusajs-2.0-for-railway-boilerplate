"use client"

import { useEffect, useState } from "react"
import { clx } from "@medusajs/ui"
import {
  DEFAULT_BRAND_FONT,
  DEFAULT_UI_FONT,
  FONT_LAB_STORAGE_KEY,
  FONT_OPTIONS,
  type FontOption,
} from "@lib/font-lab-options"

type Slot = "brand" | "ui"

type Selection = {
  brand: string
  ui: string
  linked: boolean
}

const DEFAULT_SELECTION: Selection = {
  brand: DEFAULT_BRAND_FONT,
  ui: DEFAULT_UI_FONT,
  linked: false,
}

const SAMPLE = "Kujdes i pastër, i ri & organik — Ëç 0123"

function optionById(id: string): FontOption | undefined {
  return FONT_OPTIONS.find((option) => option.id === id)
}

/* Tailwind's `sans` family reads `--font-brand` (falls back to Fredoka) and
   `hanken` reads `--font-ui` (falls back to Hanken Grotesk), so pointing those
   two variables at another loaded face restyles the whole page. */
function applySelection(selection: Selection) {
  const root = document.documentElement
  const brand = optionById(selection.brand)
  const ui = optionById(selection.linked ? selection.brand : selection.ui)

  if (brand && brand.id !== DEFAULT_BRAND_FONT) {
    root.style.setProperty("--font-brand", `var(${brand.cssVar})`)
  } else {
    root.style.removeProperty("--font-brand")
  }

  if (ui && ui.id !== DEFAULT_UI_FONT) {
    root.style.setProperty("--font-ui", `var(${ui.cssVar})`)
  } else {
    root.style.removeProperty("--font-ui")
  }
}

function readStored(): Selection {
  try {
    const raw = window.localStorage.getItem(FONT_LAB_STORAGE_KEY)
    if (!raw) return DEFAULT_SELECTION
    const parsed = JSON.parse(raw) as Partial<Selection>
    return {
      brand: optionById(parsed.brand ?? "") ? parsed.brand! : DEFAULT_BRAND_FONT,
      ui: optionById(parsed.ui ?? "") ? parsed.ui! : DEFAULT_UI_FONT,
      linked: Boolean(parsed.linked),
    }
  } catch {
    return DEFAULT_SELECTION
  }
}

/** Floating pre-launch tool for comparing typefaces on the live pages.
 * Renders only when `NEXT_PUBLIC_FONT_LAB=true` (or in development). The
 * choice persists per browser via localStorage and never touches the
 * server-rendered markup, so it is safe to leave on a preview deploy. */
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

  const activeId = slot === "brand" ? selection.brand : selection.ui
  const brandLabel = optionById(selection.brand)?.label ?? "—"
  const uiLabel =
    optionById(selection.linked ? selection.brand : selection.ui)?.label ?? "—"
  const isDefault =
    selection.brand === DEFAULT_BRAND_FONT &&
    selection.ui === DEFAULT_UI_FONT &&
    !selection.linked

  const choose = (id: string) => {
    setSelection((current) =>
      slot === "brand" ? { ...current, brand: id } : { ...current, ui: id }
    )
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
              Brand: <b>{brandLabel}</b> · Nav/UI: <b>{uiLabel}</b>
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
            aria-selected={slot === "brand"}
            onClick={() => setSlot("brand")}
            className="yco-font-lab__tab"
          >
            Brand (headings + body)
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
          Use the brand font everywhere (replaces Hanken too)
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
