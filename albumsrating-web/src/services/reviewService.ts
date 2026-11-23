import { supabase } from "@/lib/supabase"
import { toAppError } from "@/utils/errors"
import type { RatingValue, TrackReview } from "@/types/review"

interface TrackReviewResponse {
  id: string
  comment: string | null
  rating: number | null
}

function toTrackReview(resp: TrackReviewResponse): TrackReview {
  return {
    id: resp.id,
    comment: resp.comment,
    rating: resp.rating as RatingValue | null,
  }
}

export const reviewService = {
  async updateAlbumComment(reviewId: string, comment: string | null) {
    const { error } = await supabase
      .from('album_review')
      .update({ comment })
      .eq('id', reviewId)

    if (error) throw toAppError(error, 'Impossible de modifier le commentaire de l\'album.')
  },

  async updateFavoriteTrack(reviewId: string, trackId: string | null) {
    const { error } = await supabase
      .from('album_review')
      .update({ favorite_track_id: trackId })
      .eq('id', reviewId)

    if (error) throw toAppError(error, 'Impossible de mettre à jour le titre favori.')
  },

  async updateLeastFavoriteTrack(reviewId: string, trackId: string | null) {
    const { error } = await supabase
      .from('album_review')
      .update({ least_favorite_track_id: trackId })
      .eq('id', reviewId)

    if (error) throw toAppError(error, 'Impossible de mettre à jour le titre le moins aimé.')
  },

  async saveTrackRating(trackId: string, albumReviewId: string, existingReviewId: string | null, rating: RatingValue | null) {
    if (existingReviewId) {
      const { data, error } = await supabase
        .from('track_review')
        .update({ rating })
        .eq('id', existingReviewId)
        .select('id, comment, rating')
        .single<TrackReviewResponse>()

      if (error) throw toAppError(error, 'Impossible de modifier la note du titre.')
      return toTrackReview(data)
    }

    const { data, error } = await supabase
      .from('track_review')
      .insert({ track_id: trackId, album_review_id: albumReviewId, rating })
      .select('id, comment, rating')
      .single<TrackReviewResponse>()
    
    if (error) throw toAppError(error, 'Impossible d\'enregistrer la note du titre.')
    return toTrackReview(data)
  },

  async saveTrackComment(trackId: string, albumReviewId: string, existingReviewId: string | null, comment: string | null) {
    if (existingReviewId) {
      const { data, error } = await supabase
        .from('track_review')
        .update({ comment })
        .eq('id', existingReviewId)
        .select('id, comment, rating')
        .single<TrackReviewResponse>()

      if (error) throw toAppError(error, 'Impossible de modifier le commentaire du titre.')
      return toTrackReview(data)
    }

    const { data, error } = await supabase
      .from('track_review')
      .insert({ track_id: trackId, album_review_id: albumReviewId, comment })
      .select('id, comment, rating')
      .single<TrackReviewResponse>()

    if (error) throw toAppError(error, 'Impossible d\'enregistrer le commentaire du titre.')
    return toTrackReview(data)
  },
}