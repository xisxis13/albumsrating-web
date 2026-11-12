import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { supabase } from "@/lib/supabase"

export interface CollectionItemReview {
  id: string
  averageRating: number | null
}

export interface CollectionItemTrack {
  id?: string
  review: CollectionItemTrackReview | null
}

export interface CollectionItemTrackReview {
  id: string
  rating: number | null
}

export interface CollectionItem {
  reviewId: string
  createdAt: string
  lastModifiedAt: string
  album: {
    id: string
    spotifyId: string
    title: string
    coverUrl: string | null
    releaseYear: number
    artists: string[]
    tracks: CollectionItemTrack[]
    review: CollectionItemReview
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
    album_artist: { artist: { name: string } }[]
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

export const useCollectionStore = defineStore('collection', () => {
  const items = ref<CollectionItem[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)
  const adding = ref<string[]>([])

  const spotifyIds = computed(() => new Set(items.value.map((i) => i.album.spotifyId)))
  const count = computed(() => items.value.length)

  function has(spotifyId: string) {
    return spotifyIds.value.has(spotifyId)
  }

  function isAdding(spotifyId: string) {
    return adding.value.includes(spotifyId)
  }

  const recentlyAdded = computed(() => items.value.slice(0, 5))

  const recentlyUpdated = computed(() =>
    [...items.value]
      .filter((item) => item.lastModifiedAt !== item.createdAt)
      .sort((a, b) => new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime())
      .slice(0, 5),
  )

  async function fetchCollection(force = false) {
    if (loading.value || (loaded.value && !force)) return

    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('album_review')
      .select(
        'id, created_at, last_modified_at, album(id, spotify_id, title, cover_url, release_year, album_artist(artist(name)), tracks:track(id, track_review(id, rating)), album_review(id, average_rating))',
      )
      .order('created_at', { ascending: false })

    if (fetchError) {
      error.value = 'Impossible de charger votre collection.'
    } else {
      items.value = (data as unknown as CollectionResponse[]).map((resp) => {
        const albumReview = resp.album.album_review?.find((ar) => ar.id === resp.id) ?? resp.album.album_review?.[0]

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
            artists: resp.album.album_artist.map((aa) => aa.artist.name),
            tracks: (resp.album.tracks ?? []).map((t) => {
              const tr = t.track_review?.[0] ?? null
              return {
                id: t.id,
                review: tr ? { id: tr.id, rating: tr.rating } : null,
              }
            }),
            review: {
              id: albumReview?.id ?? resp.id,
              averageRating: albumReview?.average_rating ?? null,
            },
          },
        }
      })
      loaded.value = true
    }

    loading.value = false
  }

  async function addAlbum(spotifyId: string) {
    if (has(spotifyId) || isAdding(spotifyId)) return

    adding.value.push(spotifyId)
    error.value = null

    const { error: invokeError } = await supabase.functions.invoke('add-album', {
      body: { spotifyId },
    })

    if (invokeError) {
      error.value = "L'ajout a échoué. Réessayez dans un instant."
    } else {
      await fetchCollection(true)
    }

    adding.value = adding.value.filter((id) => id !== spotifyId)
  }

  async function removeAlbum(reviewId: string) {
    error.value = null

    const { data, error: deleteError } = await supabase
      .from('album_review')
      .delete()
      .eq('id', reviewId)
      .select('id')

    if (deleteError || !data || data.length === 0) {
      error.value = 'La suppression a échoué.'
      return
    }

    items.value = items.value.filter((i) => i.reviewId !== reviewId)
  }

  function reset() {
    items.value = []
    loaded.value = false
    loading.value = false
    error.value = null
    adding.value = []
  }

  return { items, loading, loaded, error, count, has, isAdding, recentlyAdded, recentlyUpdated, fetchCollection, addAlbum, removeAlbum, reset }
})