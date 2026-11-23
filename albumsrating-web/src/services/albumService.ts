import { supabase } from "@/lib/supabase"
import { AppError, toAppError } from "@/utils/errors"
import type { AlbumDetail, Artist, SearchAlbumsResult } from "@/types/album"
import type { RatingValue } from "@/types/review"

interface ArtistResponse {
  artist: {
    id: string
    spotify_id: string
    name: string
  }
}

interface AlbumDetailResponse {
  id: string
  spotify_id: string
  title: string
  cover_url: string | null
  release_year: number
  album_type: string
  album_artist: ArtistResponse[]
  track: {
    id: string
    spotify_id: string
    title: string
    track_number: number
    disc_number: number
    duration_ms: number | null
    track_artist: ArtistResponse[]
    track_review: {
      id: string
      comment: string | null
      rating: number | null
    }[]
  }[]
  album_review: {
    id: string
    created_at: string
    last_modified_at: string
    comment: string | null
    favorite_track_id: string | null
    least_favorite_track_id: string | null
    average_rating: number | null
  }[]
}

interface EdgeAlbumResponse {
  spotifyId: string
  title: string
  coverUrl: string | null
  releaseYear: number
  albumType: string
  artists: { spotifyId: string; name: string }[]
  tracks: {
    spotifyId: string
    title: string
    trackNumber: number
    discNumber: number
    durationMs: number | null
    artists: { spotifyId: string; name: string }[]
  }[]
}

function mapArtists(links: ArtistResponse[]): Artist[] {
  return links.map((l) => ({
    id: l.artist.id,
    spotifyId: l.artist.spotify_id,
    name: l.artist.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))
}

function toAlbumDetail(resp: AlbumDetailResponse): AlbumDetail {
  const review = resp.album_review[0] ?? null

  return {
    id: resp.id,
    spotifyId: resp.spotify_id,
    title: resp.title,
    coverUrl: resp.cover_url,
    releaseYear: resp.release_year,
    albumType: resp.album_type,
    artists: mapArtists(resp.album_artist),
    review: review
      ? {
          id: review.id,
          createdAt: review.created_at,
          lastModifiedAt: review.last_modified_at,
          comment: review.comment,
          favoriteTrackId: review.favorite_track_id,
          leastFavoriteTrackId: review.least_favorite_track_id,
          averageRating: review.average_rating != null ? Number(review.average_rating) : null,
        }
      : null,
    tracks: resp.track
      .map((t) => {
        const trackRev = t.track_review?.[0] ?? null
        return {
          id: t.id,
          spotifyId: t.spotify_id,
          title: t.title,
          trackNumber: t.track_number,
          discNumber: t.disc_number,
          durationMs: t.duration_ms,
          artists: mapArtists(t.track_artist),
          review: trackRev
            ? {
                id: trackRev.id,
                comment: trackRev.comment,
                rating: trackRev.rating as RatingValue | null,
              }
            : null,
        }
      })
      .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber),
  }
}

function fromEdgeAlbum(data: EdgeAlbumResponse): AlbumDetail {
  return {
    spotifyId: data.spotifyId,
    title: data.title,
    coverUrl: data.coverUrl,
    releaseYear: data.releaseYear,
    albumType: data.albumType,
    artists: data.artists.map((a) => ({
      spotifyId: a.spotifyId,
      name: a.name,
    })),
    review: null,
    tracks: data.tracks
      .map((t) => ({
        spotifyId: t.spotifyId,
        title: t.title,
        trackNumber: t.trackNumber,
        discNumber: t.discNumber,
        durationMs: t.durationMs,
        artists: t.artists.map((a) => ({
          spotifyId: a.spotifyId,
          name: a.name,
        })),
        review: null,
      }))
      .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber),
  }
}

export const albumService = {
  async searchAlbum(query: string, offset = 0) {
    const { data, error } = await supabase.functions.invoke<SearchAlbumsResult>('search-albums', {
      body: { q: query, offset },
    })

    if (error) throw toAppError(error, 'La recherche a échoué. Réassayez dans un instant.')
    if (!data) throw new AppError('UNKNOWN', 'Aucune réponse reçue lors de la recherche.')

    return data
  },

  async getAlbumDetails(spotifyId: string) {
    const { data, error } = await supabase
      .from('album')
      .select('id, spotify_id, title, cover_url, release_year, album_type, album_artist(artist(id, spotify_id, name)), track(id, spotify_id, title, track_number, disc_number, duration_ms, track_artist(artist(id, spotify_id, name)), track_review(id, comment, rating)), album_review(id, created_at, last_modified_at, comment, favorite_track_id, least_favorite_track_id, average_rating)',)
      .eq('spotify_id', spotifyId)
      .maybeSingle<AlbumDetailResponse>()

    if (error) throw toAppError(error, 'Impossible de charger l\'album.')

    if (data && data.track.length > 0) {
      return toAlbumDetail(data)
    }

    const { data: spotifyData, error: invokeError } = await supabase.functions.invoke<EdgeAlbumResponse>('get-album', {
      body: { spotifyId },
    })

    if (invokeError) throw toAppError(invokeError, 'Album introuvable.')
    if (!spotifyData) throw new AppError('NOT_FOUND', 'Album introuvable.')

    return fromEdgeAlbum(spotifyData)
  },
}