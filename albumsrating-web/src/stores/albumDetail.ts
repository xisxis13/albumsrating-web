import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AlbumTrack {
  id: string | null
  spotifyId: string
  title: string
  trackNumber: number
  discNumber: number
  durationMs: number | null
}

export interface AlbumDetail {
  id: string | null // idem
  spotifyId: string
  title: string
  coverUrl: string | null
  releaseYear: number
  albumType: string
  artists: string[]
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
  }[]
}

interface SpotifyAlbumResponse {
  spotifyId: string
  title: string
  coverUrl: string | null
  releaseYear: number
  albumType: string
  artists: string[]
  tracks: Omit<AlbumTrack, 'id'>[]
}

function sortTracks(tracks: AlbumTrack[]): AlbumTrack[] {
  return [...tracks].sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber)
}

export const useAlbumDetailStore = defineStore('albumDetail', () => {
  const album = ref<AlbumDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notFound = ref(false)
  let currentRequest = ''

  async function fetchAlbum(spotifyId: string) {
    currentRequest = spotifyId
    loading.value = true
    error.value = null
    notFound.value = false
    album.value = null

    const { data, error: fetchError } = await supabase
      .from('album')
      .select(
        'id, spotify_id, title, cover_url, release_year, album_type, album_artist(artist(name)), track(id, spotify_id, title, track_number, disc_number, duration_ms)',
      )
      .eq('spotify_id', spotifyId)
      .maybeSingle()

    if (currentRequest !== spotifyId) return

    if (fetchError) {
      error.value = "Impossible de charger l'album."
      loading.value = false
      return
    }

    const row = data as unknown as AlbumRow | null
    if (row && row.track.length > 0) {
      album.value = {
        id: row.id,
        spotifyId: row.spotify_id,
        title: row.title,
        coverUrl: row.cover_url,
        releaseYear: row.release_year,
        albumType: row.album_type,
        artists: row.album_artist.map((aa) => aa.artist.name),
        tracks: sortTracks(
          row.track.map((t) => ({
            id: t.id,
            spotifyId: t.spotify_id,
            title: t.title,
            trackNumber: t.track_number,
            discNumber: t.disc_number,
            durationMs: t.duration_ms,
          })),
        ),
      }
      loading.value = false
      return
    }

    const { data: spotifyData, error: invokeError } =
      await supabase.functions.invoke<SpotifyAlbumResponse>('get-album', { body: { spotifyId } })

    if (currentRequest !== spotifyId) return

    if (invokeError || !spotifyData) {
      if (invokeError instanceof FunctionsHttpError && invokeError.context.status === 404) {
        notFound.value = true
      } else {
        error.value = "Impossible de charger l'album."
      }
    } else {
      album.value = {
        ...spotifyData,
        id: null,
        tracks: sortTracks(spotifyData.tracks.map((t) => ({ ...t, id: null }))),
      }
    }

    loading.value = false
  }

  return { album, loading, error, notFound, fetchAlbum }
})