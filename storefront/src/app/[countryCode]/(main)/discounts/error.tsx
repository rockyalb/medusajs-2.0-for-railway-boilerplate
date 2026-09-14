"use client"

export default function DiscountsError({ reset }: { reset: () => void }) {
  return (
    <div className="content-container py-12 text-center text-yco-charcoal">
      <h2 className="mb-3 text-2xl-semi">Ofertat nuk u ngarkuan</h2>
      <p className="mb-6">Ju lutemi provoni përsëri.</p>
      <button type="button" onClick={reset} className="yco-btn yco-btn--ink">
        Provo përsëri
      </button>
    </div>
  )
}
