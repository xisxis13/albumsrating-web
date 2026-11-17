import type { AlbumReview, TrackReview } from './review'

export interface Artist {
  id?: string
  spotifyId: string
  name: string
}

export interface AlbumBase {
  spotifyId: string
  title: string
  coverUrl: string | null
  artists: Artist[]
}

export interface SearchAlbum extends AlbumBase {
  releaseDate: string
  albumType: string
  totalTracks: number
}

export interface SearchAlbumsResult {
  items: SearchAlbum[]
  total: number
  offset: number
}

export interface AlbumTrack {
  id?: string
  spotifyId: string
  title: string
  trackNumber: number
  discNumber: number
  durationMs: number | null
  artists: Artist[]
  review: TrackReview | null
}

export interface AlbumDetail extends AlbumBase {
  id?: string
  releaseYear: number
  albumType: string
  review: AlbumReview | null
  tracks: AlbumTrack[]
}