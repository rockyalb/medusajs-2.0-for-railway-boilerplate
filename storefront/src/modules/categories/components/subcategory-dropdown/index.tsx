"use client"

import { Popover, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

const formatSubcategoryName = (name: string) => {
  const lowerName = name.trim().toLocaleLowerCase("sq-AL")

  return lowerName
    ? lowerName.charAt(0).toLocaleUpperCase("sq-AL") + lowerName.slice(1)
    : name
}

export default function SubcategoryDropdown({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  if (!categories.length) {
    return null
  }

  return (
    <Popover className="relative mb-7 w-fit">
      {({ open }) => (
        <>
          <Popover.Button className="group inline-flex min-h-[44px] items-center gap-3 rounded-circle border border-white/70 bg-white/60 px-5 font-hanken text-xs font-bold uppercase tracking-[0.12em] text-yco-charcoal shadow-[0_16px_34px_-26px_rgba(47,45,41,0.5)] backdrop-blur-md transition-all hover:border-yco-charcoal/25 hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yco-charcoal focus-visible:ring-offset-2">
            <span>Nënkategoritë</span>
            <span className="rounded-circle bg-yco-panel-dark px-2 py-0.5 text-[10px] tracking-normal text-yco-charcoal-muted">
              {categories.length}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className={`transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            >
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="translate-y-2 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition duration-150 ease-in"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="translate-y-2 opacity-0"
          >
            <Popover.Panel className="absolute left-0 top-full z-40 mt-3 w-[min(88vw,30rem)] overflow-hidden rounded-large border border-white/70 bg-yco-panel/95 p-2 shadow-[0_28px_70px_-30px_rgba(47,45,41,0.65)] backdrop-blur-xl">
              <div className="mb-2 px-3 pb-2 pt-3">
                <p className="rhode-eyebrow">Zgjidh nënkategorinë</p>
                <div className="yco-tricolor-rule mt-2" />
              </div>
              <ul className="grid max-h-[min(60vh,26rem)] gap-1 overflow-y-auto p-1 xsmall:grid-cols-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="flex min-h-[48px] items-center rounded-rounded px-3 py-2.5 font-hanken text-sm font-bold leading-snug text-yco-charcoal transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yco-charcoal"
                      aria-label={`Bli ${category.name}`}
                    >
                      {formatSubcategoryName(category.name)}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
