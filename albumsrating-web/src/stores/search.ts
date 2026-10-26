import { defineStore } from "pinia"
import { ref } from "vue"
import { supabase } from "@/lib/supabase"

export interface SearchArtist {
  spotifyId: string
  name: string
}

export interface SearchAlbum {
  spotifyId: string
  title: string
  artists: SearchArtist[]
  coverUrl: string | null
  releaseDate: string
  albumType: string
  totalTracks: number
}

interface SearchResponse {
  items: SearchAlbum[]
  total: number
  offset: number
}

const PAGE_SIZE = 10

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref<SearchAlbum[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasSearched = ref(false)

  async function fetchPage(q: string, offset: number): Promise<SearchResponse | null> {
    const { data, error: invokeError } = await supabase.functions.invoke<SearchResponse>(
      'search-albums',
      { body: { q, offset } },
    )

    if (invokeError || !data) {
      error.value = 'La recherche à échoué. Réessaie dans un instant.'
      return null
    }
    return data
  }

  async function search(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return

    loading.value = true
    error.value = null
    query.value = trimmed

    const data = await fetchPage(trimmed, 0)
    if (data) {
      results.value = data.items
      total.value = data.total
    } else {
      results.value = []
      total.value = 0
    }

    hasSearched.value = true
    loading.value = false
  }

  async function loadMore() {
    if (loading.value || results.value.length >= total.value) return 

    loading.value = true
    error.value = null

    const data = await fetchPage(query.value, results.value.length)
    if (data) {
      results.value.push(...data.items)
    }

    loading.value = false
  }

  return { query, results, total, loading, error, hasSearched, search, loadMore, PAGE_SIZE }
})