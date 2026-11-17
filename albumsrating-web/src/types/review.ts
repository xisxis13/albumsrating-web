import type { RATINGS } from '@/constants/ratings'

export type RatingValue = (typeof RATINGS)[number]['value']

export interface TrackReview {
  id: string
  comment: string | null
  rating: RatingValue | null
}

// TODO: Remove averageRating from DB, it need to be calculate
export interface AlbumReview {
  id: string
  createdAt: string
  lastModifiedAt: string
  comment: string | null
  favoriteTrackId: string | null
  leastFavoriteTrackId: string | null
  averageRating: number | null
}