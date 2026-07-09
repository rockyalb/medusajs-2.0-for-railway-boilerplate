import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonProductGrid = () => {
  return (
    <ul
      className="grid flex-1 grid-cols-2 gap-x-3 gap-y-6 small:grid-cols-3 small:gap-x-6 small:gap-y-8 medium:grid-cols-3 large:grid-cols-4"
      data-testid="products-list-loader"
    >
      {repeat(8).map((index) => (
        <li key={index}>
          <SkeletonProductPreview />
        </li>
      ))}
    </ul>
  )
}

export default SkeletonProductGrid
