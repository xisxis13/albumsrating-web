import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { collectionService } from "@/services/collectionService"
import { useNotificationStore } from "./notificationStore"
import { getErrorMessage } from "@/utils/errors"
import type { CollectionItem } from "@/types/collection"

export const useCollectionStore = defineStore('collection', () => {
  const notificationStore = useNotificationStore()

  const items = ref<CollectionItem[]>([])
  const loading = ref(false)
  const loaded = ref(false)
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

    try {
      items.value = await collectionService.getCollection()
      loaded.value = true
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  async function addAlbum(spotifyId: string) {
    if (has(spotifyId) || isAdding(spotifyId)) return

    adding.value.push(spotifyId)

    try {
      await collectionService.addAlbum(spotifyId)
      await fetchCollection(true)
      notificationStore.success('Album ajouté à votre collection.')
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      adding.value = adding.value.filter((id) => id !== spotifyId)
    }
  }

  async function removeAlbum(reviewId: string) {
    try {
      await collectionService.removeAlbum(reviewId)
      items.value = items.value.filter((i) => i.reviewId !== reviewId)
      notificationStore.success('Album retiré de votre collection.')
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    }
  }

  function clear() {
    items.value = []
    loaded.value = false
    loading.value = false
    adding.value = []
  }
  
  return { 
    items,
    loading,
    loaded,
    count,
    has,
    isAdding,
    recentlyAdded,
    recentlyUpdated,
    fetchCollection,
    addAlbum,
    removeAlbum,
    clear,
  }
})