import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { albumService } from "@/services/albumService"
import { reviewService } from "@/services/reviewService"
import { useCollectionStore } from "./collectionStore"
import { useNotificationStore } from "./notificationStore"
import { AppError, getErrorMessage } from "@/utils/errors"
import type { AlbumDetail } from "@/types/album"
import type { RatingValue } from "@/types/review"

export const useAlbumDetailStore = defineStore('albumDetail', () => {
  const collectionStore = useCollectionStore()
  const notificationStore = useNotificationStore()

  const album = ref<AlbumDetail | null> (null)
  const loading = ref(false)
  const notFound = ref(false)
  let currentRequest = ''

  const averageRating = computed(() => {
    const tracks = album.value?.tracks ?? []
    const ratedTracks = tracks.filter((t) => t.review?.rating != null)

    if (ratedTracks.length === 0) return null

    const total = ratedTracks.reduce((sum, t) => sum + (t.review!.rating as number), 0)
    return Number((total / ratedTracks.length).toFixed(1))
  })

  function syncCollectionItem() {
    const review = album.value?.review
    if (!review) return

    const item = collectionStore.items.find((i) => i.reviewId === review.id)
    if (!item) return

    item.lastModifiedAt = review.lastModifiedAt
    item.album.review.averageRating = review.averageRating
    item.album.tracks = (album.value?.tracks ?? [])
      .filter((t): t is typeof t & { id: string } => Boolean(t.id))
      .map((t) => ({
        id: t.id,
        review: t.review ? { id: t.review.id, rating: t.review.rating } : null,
      }))
  }

  async function fetchAlbum(spotifyId: string, silent = false) {
    currentRequest = spotifyId

    if (!silent) {
      loading.value = true
      album.value = null
    }

    notFound.value = false

    try {
      const data = await albumService.getAlbumDetails(spotifyId)
      if (currentRequest !== spotifyId) return

      album.value = data
    } catch (error) {
      if (currentRequest !== spotifyId) return

      if (error instanceof AppError && error.code === 'NOT_FOUND') {
        notFound.value = true
      } else {
        notificationStore.error(getErrorMessage(error))
      }
    } finally {
      if (currentRequest === spotifyId) {
        loading.value = false
      }
    }
  }

  async function updateAlbumComment(newComment: string | null) {
    const review = album.value?.review
    if (!review) return

    try {
      await reviewService.updateAlbumComment(review.id, newComment)
      review.comment = newComment
      review.lastModifiedAt = new Date().toISOString()
      syncCollectionItem()
      notificationStore.success('Commentaire de l\'album enregistré.')
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
      throw error
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

    try {
      await reviewService.updateFavoriteTrack(review.id, newFavoriteTrackId)
      review.favoriteTrackId = newFavoriteTrackId
      review.lastModifiedAt = new Date().toISOString()
      syncCollectionItem()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    }
  }

  async function setLeastFavoriteTrack(trackId: string) {
    const review = album.value?.review
    if (!review) return

    const newLeastFavoriteTrackId = review.leastFavoriteTrackId === trackId ? null : trackId

    try {
      await reviewService.updateLeastFavoriteTrack(review.id, newLeastFavoriteTrackId)
      review.leastFavoriteTrackId = newLeastFavoriteTrackId
      review.lastModifiedAt = new Date().toISOString()
      syncCollectionItem()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    }
  }

  async function setTrackRating(trackId: string, rating: RatingValue) {
    const track = album.value?.tracks.find((t) => t.id === trackId)
    const review = album.value?.review
    if (!track || !review) return

    try {
      track.review = await reviewService.saveTrackRating(
        trackId,
        review.id,
        track.review?.id ?? null,
        rating,
      )
      review.averageRating = averageRating.value
      review.lastModifiedAt = new Date().toISOString()
      syncCollectionItem()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    }
  }

  async function deleteTrackRating(trackId: string) {
    const track = album.value?.tracks.find((t) => t.id === trackId)
    const review = album.value?.review
    if (!track || !track.review || !review) return

    try {
      track.review = await reviewService.saveTrackRating(
        trackId,
        review.id,
        track.review.id,
        null,
      )
      review.averageRating = averageRating.value
      review.lastModifiedAt = new Date().toISOString()
      syncCollectionItem()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    }
  }

  async function setTrackComment(trackId: string, comment: string | null) {
    const track = album.value?.tracks.find((t) => t.id === trackId)
    const review = album.value?.review
    if (!track || !review) return

    try {
      track.review = await reviewService.saveTrackComment(
        trackId,
        review.id,
        track.review?.id ?? null,
        comment,
      )
      review.lastModifiedAt = new Date().toISOString()
      syncCollectionItem()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    }
  }

  async function deleteTrackComment(trackId: string) {
    const track = album.value?.tracks.find((t) => t.id === trackId)
    const review = album.value?.review
    if (!track || !track.review || !review) return

    try {
      track.review = await reviewService.saveTrackComment(
        trackId,
        review.id,
        track.review?.id ?? null,
        null,
      )
      review.lastModifiedAt = new Date().toISOString()
      syncCollectionItem()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    }
  }

  function clear() {
    album.value = null
    loading.value = false
    notFound.value = false
    currentRequest = ''
  }
  
  return { 
    album,
    loading,
    notFound,
    averageRating,
    fetchAlbum,
    updateAlbumComment,
    isFavoriteTrack,
    isLeastFavoriteTrack,
    setFavoriteTrack,
    setLeastFavoriteTrack,
    setTrackRating,
    deleteTrackRating,
    setTrackComment,
    deleteTrackComment,
    clear,
  }
})