import { defineStore } from "pinia"
import { ref } from "vue"
import { FunctionsHttpError } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export interface AlbumTrack {
  id?: string
  spotifyId: string
  title: string
  trackNumber: number
  discNumber: number
  durationMs: number | null
  artists: string[]
}

export interface AlbumReview {
  id: string
  createdAt: string
  comment: string | null
  favoriteTrackId: string | null
  leastFavoriteTrackId: string | null
}

export interface AlbumDetail {
  id?: string
  spotifyId: string
  title: string
  coverUrl: string | null
  releaseYear: number
  albumType: string
  artists: string[]
  review: AlbumReview | null
  tracks: AlbumTrack[]
}

interface AlbumResponse {
  id: string
  spotify_id: string
  title: string
  cover_url: string | null
  release_year: number
  album_type: string
  album_artist: { artist: { name: string } }[]
  track: {
    id: string
    spotify_id: string
    title: string
    track_number: number
    disc_number: number
    duration_ms: number | null
    track_artist: { artist: { name: string } }[]
  }[]
  album_review: { 
    id: string
    created_at: string
    comment: string | null
    favorite_track_id: string | null
    least_favorite_track_id: string | null
  }[]
}

function artistNames(links: { artist: { name: string } }[]): string[] {
  return links.map((l) => l.artist.name).sort((a, b) => a.localeCompare(b))
}

function toDetails(resp: AlbumResponse): AlbumDetail {
  const review = resp.album_review[0] ?? null

  return {
    id: resp.id,
    spotifyId: resp.spotify_id,
    title: resp.title,
    coverUrl: resp.cover_url,
    releaseYear: resp.release_year,
    albumType: resp.album_type,
    artists: artistNames(resp.album_artist),
    review: review
      ? { id: review.id, createdAt: review.created_at, comment: review.comment, favoriteTrackId: review.favorite_track_id, leastFavoriteTrackId: review.least_favorite_track_id }
      : null,
    tracks: resp.track
      .map((t) => ({
        id: t.id,
        spotifyId: t.spotify_id,
        title: t.title,
        trackNumber: t.track_number,
        discNumber: t.disc_number,
        durationMs: t.duration_ms,
        artists: artistNames(t.track_artist),
      }))
      .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber),
  }
}

async function queryAlbum(spotifyId: string): Promise<AlbumResponse | null> {
  const { data, error } = await supabase
    .from('album')
    .select(
      'id, spotify_id, title, cover_url, release_year, album_type, album_artist(artist(name)), track(id, spotify_id, title, track_number, disc_number, duration_ms, track_artist(artist(name))), album_review(id, created_at, comment, favorite_track_id, least_favorite_track_id)',
    )
    .eq('spotify_id', spotifyId)
    .maybeSingle()

  if (error) throw error

  const resp = data as unknown as AlbumResponse | null
  return resp && resp.track.length > 0 ? resp : null
}

export const useAlbumDetailStore = defineStore('albumDetail', () => {
  const album = ref<AlbumDetail | null> (null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notFound = ref(false)
  let currentRequest = ''

  async function fetchAlbum(spotifyId: string, silent = false) {
    currentRequest = spotifyId

    if (!silent) {
      loading.value = true
      album.value = null
    }

    error.value = null
    notFound.value = false

    try {
      // Check if album is in the DB
      const resp = await queryAlbum(spotifyId)

      if (currentRequest !== spotifyId) return

      if (resp) {
        album.value = toDetails(resp)
        return
      }

      // Getting album's data from Spotify
      const { data: spotifyData, error: invokeError } = await supabase.functions.invoke('get-album', {
        body: { spotifyId },
      })

      if (currentRequest !== spotifyId) return

      if (invokeError) {
        if (invokeError instanceof FunctionsHttpError && invokeError.context.status === 404) {
          notFound.value = true
        } else {
          error.value = "Impossible de charger l'album."
        }
        return
      }

      album.value = {
        spotifyId: spotifyData.spotifyId,
        title: spotifyData.title,
        coverUrl: spotifyData.coverUrl,
        releaseYear: spotifyData.releaseYear,
        albumType: spotifyData.albumType,
        artists: spotifyData.artists.map((a: { name: string }) => a.name),
        review: null,
        tracks: spotifyData.tracks.map((t: any) => ({
          spotifyId: t.spotifyId,
          title: t.title,
          trackNumber: t.trackNumber,
          discNumber: t.discNumber,
          durationMs: t.durationMs,
          artists: t.artists.map((a: { name: string }) => a.name),
        })),
      }
    } catch {
      if (currentRequest === spotifyId) error.value = "Impossible de charger l'albul."
    } finally {
      if (currentRequest === spotifyId) loading.value = false
    }
  }

  function isFavoriteTrack(trackId: string) {
    return album.value?.review?.favoriteTrackId === trackId
  }

  function isLeastFavoriteTrack(trackId: string) {
    return album.value?.review?.leastFavoriteTrackId === trackId
  }

  async function setFavoriteTrack(trackId: string) {
    const review = album.value?.review
    if (!review) return

    const newFavoriteTrackId = review.favoriteTrackId === trackId ? null : trackId

    const { error: updateError } = await supabase
      .from('album_review')
      .update({ favorite_track_id: newFavoriteTrackId })
      .eq('id', review.id)

    if (updateError) {
      console.error('Erreur lors de la mise à jour du titre favori : ', updateError)
      return
    }

    review.favoriteTrackId = newFavoriteTrackId
  }

  async function setLeastFavoriteTrack(trackId: string) {
    const review = album.value?.review
    if (!review) return

    const newLeastFavoriteTrackId = review.leastFavoriteTrackId === trackId ? null : trackId

    const { error: updateError } = await supabase
      .from('album_review')
      .update({ least_favorite_track_id: newLeastFavoriteTrackId })
      .eq('id', review.id)

    if (updateError) {
      console.error('Erreur lors de la mise à jour du titre le moins aimé : ', updateError)
      return
    }

    review.leastFavoriteTrackId = newLeastFavoriteTrackId
  }

  return { album, loading, error, notFound, fetchAlbum, isFavoriteTrack, isLeastFavoriteTrack, setFavoriteTrack, setLeastFavoriteTrack }
})