import { defineStore } from "pinia"
import { ref } from "vue"
import { albumService } from "@/services/albumService"
import { useNotificationStore } from "./notificationStore"
import { getErrorMessage } from "@/utils/errors"
import type { SearchAlbum } from "@/types/album"

const PAGE_SIZE = 10 // Spotify limit by search

export const useSearchStore = defineStore('search', () => {
  const notificationStore = useNotificationStore()

  const query = ref('')
  const results = ref<SearchAlbum[]>([])
  const total = ref(0)
  const loading = ref(false)
  const hasSearched = ref(false)

  async function search(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return

    loading.value = true
    query.value = trimmed

    try {
      const data = await albumService.searchAlbum(trimmed, 0)
      results.value = data.items
      total.value = data.total
    } catch (error) {
      results.value = []
      total.value = 0
      notificationStore.error(getErrorMessage(error))
    } finally {
      hasSearched.value = true
      loading.value = false
    }
  }

  async function loadMore() {
    if (loading.value || results.value.length >= total.value) return

    loading.value = true

    try {
      const data = await albumService.searchAlbum(query.value, results.value.length)
      results.value.push(...data.items)
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  function clear() {
    query.value = ''
    results.value = []
    total.value = 0
    loading.value = false
    hasSearched.value = false
  }

  return { 
    PAGE_SIZE, 
    query, 
    results,
    total, 
    loading, 
    hasSearched, 
    search, 
    loadMore,
    clear,
  }
})