import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { supabase } from "@/lib/supabase"

export interface CollectionItem {
  reviewId: string
  addedAt: string
  album: {
    id: string
    spotifyId: string
    title: string,
    coverUrl: string | null
    releaseYear: number
    artists: string[]
  }
}

interface CollectionResponse {
  id: string
  created_at: string
  album: {
    id: string
    spotify_id: string
    title: string
    cover_url: string | null
    release_year: number
    album_artist: { artist: { name: string } }[]
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

  async function fetchCollection(force = false) {
    if (loading.value || (loaded.value && !force)) return

    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('album_review')
      .select(
        'id, created_at, album(id, spotify_id, title, cover_url, release_year, album_artist(artist(name)))',
      )
      .order('created_at', { ascending: false })

    if (fetchError) {
      error.value = 'Impossible de charger votre collection.'
    } else {
      items.value = (data as unknown as CollectionResponse[]).map((resp) => ({
        reviewId: resp.id,
        addedAt: resp.created_at,
        album: {
          id: resp.album.id,
          spotifyId: resp.album.spotify_id,
          title: resp.album.title,
          coverUrl: resp.album.cover_url,
          releaseYear: resp.album.release_year,
          artists: resp.album.album_artist.map((aa) => aa.artist.name),
        },
      }))
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

  return { items, loading, loaded, error, count, has, isAdding, fetchCollection, addAlbum, removeAlbum, reset }
})