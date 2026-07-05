import { cache } from "react"

export type GoogleReview = {
  id: string
  authorName: string
  avatarUrl: string | null
  text: string
  rating: number
  publishedAt: string
  url: string | null
}

export type GoogleReviewsData = {
  reviews: GoogleReview[]
  averageRating: number
  totalReviews: number
}

type FeaturableWidgetResponse = {
  success: boolean
  widget: {
    reviews: {
      id: string
      author: { name: string; avatarUrl: string | null; profileUrl: string | null }
      text: string | null
      originalText: string | null
      rating: { value: number; max: number }
      publishedAt: string
      url: string | null
    }[]
    isExampleReviews: boolean
    gbpLocationSummary: {
      rating?: number
      reviewsCount?: number
    } | null
  }
}

/**
 * Fetches Google Business Profile reviews via the Featurable widget API.
 * Returns null while the widget only serves Featurable's example reviews
 * (i.e. the business profile isn't connected yet) or when the request fails,
 * so callers can fall back to curated content.
 */
export const getGoogleReviews = cache(
  async function (): Promise<GoogleReviewsData | null> {
    const widgetId = process.env.FEATURABLE_WIDGET_ID
    const apiKey = process.env.FEATURABLE_API_KEY

    if (!widgetId) {
      return null
    }

    try {
      const response = await fetch(
        `https://featurable.com/api/v2/widgets/${widgetId}/`,
        {
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
          next: { revalidate: 3600 },
        }
      )

      if (!response.ok) {
        return null
      }

      const data: FeaturableWidgetResponse = await response.json()

      if (!data.success || data.widget.isExampleReviews) {
        return null
      }

      // Prefer originalText: `text` may be auto-translated to the widget
      // language, while originalText is what the reviewer actually wrote.
      // originalText is an empty string (not null) when no translation exists.
      const reviewBody = (review: { originalText: string | null; text: string | null }) =>
        review.originalText?.trim() || review.text?.trim() || ""

      const reviews = data.widget.reviews
        .filter((review) => reviewBody(review))
        .map((review) => ({
          id: review.id,
          authorName: review.author.name,
          avatarUrl: review.author.avatarUrl,
          text: reviewBody(review),
          rating: review.rating.value,
          publishedAt: review.publishedAt,
          url: review.url,
        }))

      if (!reviews.length) {
        return null
      }

      const summary = data.widget.gbpLocationSummary
      const averageRating =
        summary?.rating ??
        reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length

      return {
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: summary?.reviewsCount ?? reviews.length,
      }
    } catch {
      return null
    }
  }
)
