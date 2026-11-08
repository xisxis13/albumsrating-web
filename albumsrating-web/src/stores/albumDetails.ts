import { defineStore } from "pinia"
import { computed, ref } from "vue"
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
  review: AlbumTrackReview | null
}

export interface AlbumTrackReview {
  id: string
  comment: string | null
  rating: number | null
}

export interface AlbumReview {
  id: string
  createdAt: string
  lastModifiedAt: string
  comment: string | null
  favoriteTrackId: string | null
  leastFavoriteTrackId: string | null
  averageRating: number | null
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
    track_review: { id: string, comment: string | null, rating: number | null }[]
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
      ? { id: review.id, createdAt: review.created_at, lastModifiedAt:review.last_modified_at, comment: review.comment, favoriteTrackId: review.favorite_track_id, leastFavoriteTrackId: review.least_favorite_track_id, averageRating: review.average_rating ? Number(review.average_rating) : null }
      : null,
    tracks: resp.track.map((t) => {
      const trackRev = t.track_review?.[0] ?? null
      return {
        id: t.id,
        spotifyId: t.spotify_id,
        title: t.title,
        trackNumber: t.track_number,
        discNumber: t.disc_number,
        durationMs: t.duration_ms,
        artists: artistNames(t.track_artist),
        review: trackRev ? { id: trackRev.id, comment: trackRev.comment, rating: trackRev.rating } : null
      }
    })
      .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber),
  }
}

async function queryAlbum(spotifyId: string): Promise<AlbumResponse | null> {
  const { data, error } = await supabase
    .from('album')
    .select(
      'id, spotify_id, title, cover_url, release_year, album_type, album_artist(artist(name)), track(id, spotify_id, title, track_number, disc_number, duration_ms, track_artist(artist(name)), track_review(id, comment, rating)), album_review(id, created_at, last_modified_at, comment, favorite_track_id, least_favorite_track_id, average_rating)',
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

  async function updateAlbumComment(newComment: string | null) {
    const { data, error } = await supabase
      .from('album_review')
      .update({ comment: newComment })
      .eq('id', album.value?.review?.id)
      .select()

    if (error) throw error
    return data
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
    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('album_review')
      .update({ favorite_track_id: newFavoriteTrackId })
      .eq('id', review.id)

    if (updateError) {
      console.error('Erreur lors de la mise à jour du titre favori : ', updateError)
      return
    }

    review.favoriteTrackId = newFavoriteTrackId
    review.lastModifiedAt = now
  }

  async function setLeastFavoriteTrack(trackId: string) {
    const review = album.value?.review
    if (!review) return

    const newLeastFavoriteTrackId = review.leastFavoriteTrackId === trackId ? null : trackId
    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('album_review')
      .update({ least_favorite_track_id: newLeastFavoriteTrackId })
      .eq('id', review.id)

    if (updateError) {
      console.error('Erreur lors de la mise à jour du titre le moins aimé : ', updateError)
      return
    }

    review.leastFavoriteTrackId = newLeastFavoriteTrackId
    review.lastModifiedAt = now
  }

  async function setTrackRating(trackId: string, rating: number) {
    const track = album.value?.tracks.find((t) => t.id === trackId)
    const review = album.value?.review

    if (!track) return 

    const existing = track.review

    try {
      if (existing) {
        const { error } = await supabase
          .from('track_review')
          .update({ rating })
          .eq('id', existing.id)
        
        if (error) throw error

        track.review!.rating = rating
      } else {
        const { data, error } = await supabase
          .from('track_review')
          .insert({ track_id: trackId, album_review_id: review?.id, rating })
          .select('id, comment, rating')
          .single()

        if (error) throw error
        
        track.review = {
          id: data.id,
          comment: data.comment,
          rating: data.rating,
        }
      }

      if (review) {
        review.averageRating = averageRating.value
        review.lastModifiedAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note du titre : ', error)
    }
  }

  async function deleteTrackRating(trackId: string) {
    const track = album.value?.tracks.find((t) => t.id === trackId)
    const review = album.value?.review

    if (!track) return 

    const existing = track.review

    try {
      if (existing) {
        const { error } = await supabase
          .from('track_review')
          .update({ rating: null })
          .eq('id', existing.id)
        
        if (error) throw error

        track.review!.rating = null
      }

      if (review) {
        review.averageRating = averageRating.value
        review.lastModifiedAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la note du titre : ', error)
    }
  }

  async function setTrackComment(trackId: string, comment: string | null) {
    const track = album.value?.tracks.find((t) => t.id === trackId)
    const review = album.value?.review

    if (!track) return 

    const existing = track.review

    try {
      if (existing) {
        const { error } = await supabase
          .from('track_review')
          .update({ comment })
          .eq('id', existing.id)

        if (error) throw error

        track.review!.comment = comment
      } else {
        const { data, error } = await supabase
          .from('track_review')
          .insert({ track_id: trackId, album_review_id: review?.id, comment })
          .select('id, comment, rating')
          .single()

        if (error) throw error

        track.review = {
          id: data.id,
          comment: data.comment,
          rating: data.rating,
        }
      }

      if (review) {
        review.lastModifiedAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire du titre : ', error)
    }
  }

  async function deleteTrackComment(trackId: string) {
    const track = album.value?.tracks.find((t) => t.id === trackId)
    const review = album.value?.review

    if (!track || !track.review) return

    try {
      const { error } = await supabase
        .from('track_review')
        .update({ comment: null })
        .eq('id', track.review.id)

      if (error) throw error

      track.review.comment = null

      if (review) {
        review.lastModifiedAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire du titre : ', error)
    }
  }

  const averageRating = computed(() => {
    const tracks = album.value?.tracks ?? []
    const ratedTracks = tracks.filter((t) => t.review?.rating != null)

    if (ratedTracks.length === 0) return null

    const total = ratedTracks.reduce((sum, t) => sum + (t.review!.rating as number), 0)
    return Number((total / ratedTracks.length).toFixed(1))
  })

  return { album, loading, error, notFound, fetchAlbum, updateAlbumComment, isFavoriteTrack, isLeastFavoriteTrack, setFavoriteTrack, setLeastFavoriteTrack, setTrackRating, deleteTrackRating, setTrackComment, deleteTrackComment, averageRating }
})