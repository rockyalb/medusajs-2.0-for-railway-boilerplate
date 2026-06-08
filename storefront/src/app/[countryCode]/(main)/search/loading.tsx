export default function SearchLoading() {
  return (
    <div className="relative z-[75]">
      <div className="yco-search-overlay fixed inset-0 h-screen w-screen bg-yco-charcoal/20 backdrop-blur-xl" />
      <div className="fixed inset-0 grid place-items-center px-6">
        <div className="yco-search-loading-cue flex min-h-[58px] w-full max-w-[18rem] items-center gap-3 rounded-circle border border-yco-cream-dark bg-white px-5 shadow-[0_24px_60px_-32px_rgba(47,45,41,0.75)]">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-circle bg-yco-panel">
            <span className="yco-accent-dot" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-yco-charcoal-muted">
              Opening search
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-circle bg-yco-panel">
              <div className="yco-search-loading-bar h-full w-1/2 rounded-circle bg-pastel-coral" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
