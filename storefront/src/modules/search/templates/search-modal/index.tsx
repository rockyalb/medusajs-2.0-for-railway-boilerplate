"use client"

import { Configure, InstantSearch } from "react-instantsearch"
import { useRouter } from "next/navigation"
import { MagnifyingGlassMini, XMarkMini } from "@medusajs/icons"

import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client"
import Hit from "@modules/search/components/hit"
import Hits from "@modules/search/components/hits"
import SearchBox from "@modules/search/components/search-box"
import { ComponentType, useEffect, useRef } from "react"

const SearchConfigure = Configure as ComponentType<{ hitsPerPage: number }>

export default function SearchModal() {
  const router = useRouter()
  const searchRef = useRef(null)

  // close modal on outside click
  const handleOutsideClick = (event: MouseEvent) => {
    if (event.target === searchRef.current) {
      router.back()
    }
  }

  useEffect(() => {
    window.addEventListener("click", handleOutsideClick)
    // cleanup
    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // disable scroll on body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  // on escape key press, close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back()
      }
    }
    window.addEventListener("keydown", handleEsc)

    // cleanup
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative z-[75]">
      <div className="yco-search-overlay fixed inset-0 h-screen w-screen bg-yco-charcoal/20 backdrop-blur-xl" />
      <div className="fixed inset-0 px-3 py-3 sm:p-6" ref={searchRef}>
        <div className="flex h-full w-full items-start justify-center text-left align-middle">
          <InstantSearch
            indexName={SEARCH_INDEX_NAME}
            searchClient={searchClient}
          >
            <SearchConfigure hitsPerPage={6} />
            <div
              className="yco-search-sheet flex h-[calc(100vh-1.5rem)] w-full flex-col overflow-hidden rounded-large border border-yco-cream-dark bg-white shadow-[0_32px_80px_-34px_rgba(47,45,41,0.7)] sm:h-auto sm:max-h-[calc(100vh-3rem)] sm:w-[min(56rem,calc(100vw-3rem))]"
              data-testid="search-modal-container"
            >
              <div className="border-b border-yco-cream-dark bg-yco-panel px-4 py-4 sm:px-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="rhode-eyebrow">Kërko në YCO</p>
                    <div className="yco-tricolor-rule mt-2" />
                  </div>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    aria-label="Mbyll kërkimin"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-circle border border-yco-charcoal/25 bg-white text-yco-charcoal transition-colors duration-200 hover:bg-yco-charcoal hover:text-white"
                  >
                    <XMarkMini />
                  </button>
                </div>
                <div className="flex min-h-[54px] w-full items-center gap-3 rounded-circle border border-yco-cream-dark bg-white px-4 text-yco-charcoal shadow-[0_12px_30px_-24px_rgba(47,45,41,0.9)]">
                  <MagnifyingGlassMini className="shrink-0 text-yco-charcoal-muted" />
                  <SearchBox />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <Hits hitComponent={Hit} />
              </div>
            </div>
          </InstantSearch>
        </div>
      </div>
    </div>
  )
}
