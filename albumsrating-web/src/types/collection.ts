import type { AlbumBase } from './album'
import type { AlbumReview, TrackReview } from './review'

export interface CollectionTrack {
  id: string
  review: Pick<TrackReview, 'id' | 'rating'> | null
}

export interface CollectionAlbum extends AlbumBase {
  id: string
  releaseYear: number
  tracks: CollectionTrack[]
  review: Pick<AlbumReview, 'id' | 'averageRating'>
}

export interface CollectionItem {
  reviewId: string
  createdAt: string
  lastModifiedAt: string
  album: CollectionAlbum
}