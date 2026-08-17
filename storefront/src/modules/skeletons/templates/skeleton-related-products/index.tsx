import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="product-page-constraint">
      <div className="mb-8 h-9 w-52 animate-pulse rounded-base bg-gray-100 small:mb-10"></div>
      <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4 small:gap-x-6">
        {repeat(2).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
