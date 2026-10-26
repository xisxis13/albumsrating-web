import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AlbumTrack {
  id: string
  spotifyId: string
  title: string
  trackNumber: number
  discNumber: number
  durationMs: number | null
  artists: string[]
}

export interface AlbumReviewInfo {
  id: string
  createdAt: string
  comment: string | null
}

export interface AlbumDetail {
  id: string
  spotifyId: string
  title: string
  coverUrl: string | null
  releaseYear: number
  albumType: string
  artists: string[]
  review: AlbumReviewInfo | null
  tracks: AlbumTrack[]
}

interface AlbumRow {
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
  album_review: { id: string; created_at: string; comment: string | null }[]
}

function artistNames(links: { artist: { name: string } }[]): string[] {
  return links.map((l) => l.artist.name).sort((a, b) => a.localeCompare(b))
}

function toDetail(row: AlbumRow): AlbumDetail {
  const review = row.album_review[0] ?? null

  return {
    id: row.id,
    spotifyId: row.spotify_id,
    title: row.title,
    coverUrl: row.cover_url,
    releaseYear: row.release_year,
    albumType: row.album_type,
    artists: artistNames(row.album_artist),
    review: review
      ? { id: review.id, createdAt: review.created_at, comment: review.comment }
      : null,
    tracks: row.track
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

async function queryAlbum(spotifyId: string): Promise<AlbumRow | null> {
  const { data, error } = await supabase
    .from('album')
    .select(
      'id, spotify_id, title, cover_url, release_year, album_type, album_artist(artist(name)), track(id, spotify_id, title, track_number, disc_number, duration_ms, track_artist(artist(name))), album_review(id, created_at, comment)',
    )
    .eq('spotify_id', spotifyId)
    .maybeSingle()

  if (error) throw error

  const row = data as unknown as AlbumRow | null
  return row && row.track.length > 0 ? row : null
}

export const useAlbumDetailStore = defineStore('albumDetail', () => {
  const album = ref<AlbumDetail | null>(null)
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
      let row = await queryAlbum(spotifyId)

      if (!row) {
        const { error: invokeError } = await supabase.functions.invoke('ensure-album', {
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

        row = await queryAlbum(spotifyId)
      }

      if (currentRequest !== spotifyId) return

      if (row) {
        album.value = toDetail(row)
      } else {
        error.value = "Impossible de charger l'album."
      }
    } catch {
      if (currentRequest === spotifyId) error.value = "Impossible de charger l'album."
    } finally {
      if (currentRequest === spotifyId) loading.value = false
    }
  }

  return { album, loading, error, notFound, fetchAlbum }
})