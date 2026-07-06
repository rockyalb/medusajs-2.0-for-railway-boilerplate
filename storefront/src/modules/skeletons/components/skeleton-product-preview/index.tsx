const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-large border border-white/60 bg-white/60 backdrop-blur-[6px]">
      <div className="aspect-[3/4] w-full bg-yco-panel" />
      <div className="space-y-2 border-t border-yco-cream-dark px-4 pb-4 pt-3">
        <div className="h-4 w-3/4 rounded-base bg-yco-panel" />
        <div className="h-4 w-1/3 rounded-base bg-yco-panel" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
