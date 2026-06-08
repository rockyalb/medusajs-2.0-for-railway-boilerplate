export default function SearchLoading() {
  return (
    <div className="relative z-[75]">
      <div className="yco-search-overlay fixed inset-0 h-screen w-screen bg-yco-charcoal/20 backdrop-blur-xl" />
      <div className="fixed inset-0 px-3 py-3 sm:p-6">
        <div className="flex h-full w-full items-start justify-center">
          <div className="yco-search-sheet flex h-[calc(100vh-1.5rem)] w-full flex-col overflow-hidden rounded-large border border-yco-cream-dark bg-white shadow-[0_32px_80px_-34px_rgba(47,45,41,0.7)] sm:h-[32rem] sm:w-[min(56rem,calc(100vw-3rem))]">
            <div className="border-b border-yco-cream-dark bg-yco-panel px-4 py-4 sm:px-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="rhode-eyebrow">Search YCO</p>
                  <div className="yco-tricolor-rule mt-2" />
                </div>
                <div className="h-11 w-11 rounded-circle border border-yco-charcoal/15 bg-white" />
              </div>
              <div className="flex min-h-[54px] items-center gap-3 rounded-circle border border-yco-cream-dark bg-white px-4">
                <div className="h-4 w-4 rounded-circle bg-yco-charcoal-muted/30" />
                <div className="h-3 w-44 max-w-[60%] rounded-circle bg-yco-panel-dark" />
              </div>
            </div>
            <div className="grid flex-1 content-start gap-3 px-4 py-4 sm:grid-cols-3 sm:px-5 sm:py-5">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="yco-search-hit flex items-center gap-3 rounded-large border border-yco-cream-dark bg-yco-panel p-2.5 sm:flex-col sm:items-stretch sm:p-3"
                  style={{ animationDelay: `${item * 45}ms` }}
                >
                  <div className="h-16 w-16 shrink-0 rounded-rounded bg-white sm:h-auto sm:w-full sm:aspect-square" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-4/5 rounded-circle bg-yco-charcoal-muted/20" />
                    <div className="h-3 w-1/2 rounded-circle bg-yco-charcoal-muted/15" />
                    <div className="h-7 w-24 rounded-circle bg-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
