import { supabase } from "@/lib/supabase"
import { AppError, toAppError } from "@/utils/errors"
import type { Artist } from "@/types/album"
import type { CollectionItem } from "@/types/collection"
import type { RatingValue } from "@/types/review"

interface ArtistResponse {
  artist: {
    id: string
    spotify_id: string
    name: string
  }
}

interface CollectionResponse {
  id: string
  created_at: string
  last_modified_at: string
  album: {
    id: string
    spotify_id: string
    title: string
    cover_url: string | null
    release_year: number
    album_artist: ArtistResponse[]
    tracks: {
      id: string
      track_review: { id: string; rating: number | null }[]
    }[]
    album_review: {
      id: string
      average_rating: number | null
    }[]
  }
}

function mapArtists(links: ArtistResponse[]): Artist[] {
  return links.map((l) => ({
    id: l.artist.id,
    spotifyId: l.artist.spotify_id,
    name: l.artist.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))
}

function toCollectionItem(resp: CollectionResponse): CollectionItem {
  const albumReview =
    resp.album.album_review?.find((ar) => ar.id === resp.id) ?? resp.album.album_review?.[0]

  return {
    reviewId: resp.id,
    createdAt: resp.created_at,
    lastModifiedAt: resp.last_modified_at,
    album: {
      id: resp.album.id,
      spotifyId: resp.album.spotify_id,
      title: resp.album.title,
      coverUrl: resp.album.cover_url,
      releaseYear: resp.album.release_year,
      artists: mapArtists(resp.album.album_artist),
      tracks: (resp.album.tracks ?? []).map((t) => {
        const tr = t.track_review?.[0] ?? null
        return {
          id: t.id,
          review: tr
            ? {
                id: tr.id,
                rating: tr.rating as RatingValue | null,
              }
            : null,
        }
      }),
      review: {
        id: albumReview?.id ?? resp.id,
        averageRating: albumReview?.average_rating != null ? Number(albumReview.average_rating) : null,
      },
    },
  }
}

export const collectionService = {
  async getCollection() {
    const { data, error } = await supabase
      .from('album_review')
      .select('id, created_at, last_modified_at, album(id, spotify_id, title, cover_url, release_year, album_artist(artist(id, spotify_id, name)), tracks:track(id, track_review(id, rating)), album_review(id, average_rating))',)
      .order('created_at', { ascending: false })

    if (error) throw toAppError(error, 'Impossible de charger votre collection.')

    return (data as unknown as CollectionResponse[]).map(toCollectionItem)
  },

  async addAlbum(spotifyId: string) {
    const { error } = await supabase.functions.invoke('add-album', {
      body: { spotifyId },
    })

    if (error) throw toAppError(error, 'l\'ajout a échoué. Réassayez dans un instant.')
  },

  async removeAlbum(reviewId: string) {
    const { data, error } = await supabase
      .from('album_review')
      .delete()
      .eq('id', reviewId)
      .select('id')

    if (error) throw toAppError(error, 'La suppression a échoué.')
    if (!data || data.length === 0) {
      throw new AppError('NOT_FOUND', 'Album introuvable dans votre collection.')
    }
  },
}