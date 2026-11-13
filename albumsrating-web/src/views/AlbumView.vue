<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAlbumDetailStore } from '@/stores/albumDetails'
import { useCollectionStore } from '@/stores/collection'

import { 
  ArrowLeft, 
  EighthNotes, 
  Trash2,
  PanelRightClose,
  PanelRightOpen,
  Heart, 
  HeartOff,
  Star,
  X,
} from '@lucide/vue'
import NavigationRail from '@/components/NavigationRail.vue'
import TrackRow from '@/components/TrackRow.vue'
import RatingDistributionItem from '@/components/RatingDistributionItem.vue'

import type { AlbumTrack } from '@/stores/albumDetails'

const route = useRoute()
const router = useRouter()
const albumStore = useAlbumDetailStore()
const collectionStore = useCollectionStore()

const spotifyId = computed(() => String(route.params.spotifyId))
const isAdding = computed(() => {
  const id = albumStore.album?.spotifyId
  return id ? collectionStore.isAdding(id) : false
})

const isRightMenuOpen = ref(false)
const isEditingComment = ref(false)
const isUpdating = ref(false)
const comment = ref('')

const RATING_CATEGORIES = [
  { value: 5, label: 'Incroyable', colorClass: 'bg-masterpiece' },
  { value: 4, label: 'Très bien', colorClass: 'bg-great' },
  { value: 3, label: 'Bien', colorClass: 'bg-good' },
  { value: 2, label: 'Moyen', colorClass: 'bg-mid' },
  { value: 1, label: 'À zapper', colorClass: 'bg-skip' }
]

const ratingDistribution = computed(() => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const tracks = albumStore.album?.tracks ?? []

  for (const track of tracks) {
    if (track.review?.rating) {
      counts[track.review.rating] = (counts[track.review.rating] || 0) + 1
    }
  }

  const maxCount = Math.max(...Object.values(counts), 1)

  return { counts, maxCount }
})

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/')
}

function toggleRightMenuState() {
  isRightMenuOpen.value = !isRightMenuOpen.value
}

function trackArtists(track: AlbumTrack): string[] {
  const albumArtists = albumStore.album?.artists ?? []
  const same = 
    track.artists.length === albumArtists.length &&
    track.artists.every((name) => albumArtists.includes(name))
  return same ? [] : track.artists
}

async function addToCollection() {
  if (!albumStore.album) return
  await collectionStore.addAlbum(albumStore.album.spotifyId)
  await albumStore.fetchAlbum(spotifyId.value, true)
}

async function removeFromCollection() {
  const album = albumStore.album

  if (!album?.review) return

  const confirmed = window.confirm(
    `Retirer « ${album.title} » de votre collection ?\nVos notes et commentaires sur cet album seront supprimés.`
  )

  if (confirmed) await collectionStore.removeAlbum(album.review.id)
  await albumStore.fetchAlbum(spotifyId.value, true)
}

function startEditing() {
  comment.value = albumStore.album?.review?.comment || ''
  isEditingComment.value = true
}

function cancelEditing() {
  isEditingComment.value = false
  comment.value = ''
}

async function updateAlbumComment() {
  const reviewId = albumStore.album?.review?.id
  if (!reviewId) return

  try {
    isUpdating.value = true
    const newCommentValue = comment.value.trim() || null
    await albumStore.updateAlbumComment(newCommentValue)
    
    if (albumStore.album && albumStore.album.review) {
      albumStore.album.review.comment = newCommentValue
    }
  } catch (error) {
    console.error("Erreur lors de la modification du commentaire.", error)
  } finally {
    isUpdating.value = false
    cancelEditing()
  }
}

async function handleSetFavoriteTrack(track: AlbumTrack) {
  albumStore.setFavoriteTrack(track.id!!)
}

async function handleSetLeastFavoriteTrack(track: AlbumTrack) {
  albumStore.setLeastFavoriteTrack(track.id!!)
}

function handleSetRating(track: AlbumTrack, rating: number) {
  console.log(`Note reçue pour ${track.title} : ${rating}`)
  albumStore.setTrackRating(track.id!!, rating)
}

function handleDeleteTrackRating(track: AlbumTrack) {
  albumStore.deleteTrackRating(track.id!!)
}

function handleSetTrackComment(track: AlbumTrack, comment: string | null) {
  albumStore.setTrackComment(track.id!, comment)
}

function handleDeleteTrackComment(track: AlbumTrack) {
  albumStore.deleteTrackComment(track.id!)
}

const favoriteTrackTitle = computed(() => {
  const trackId = albumStore.album?.review?.favoriteTrackId
  if (!trackId) return null
  return albumStore.album?.tracks.find(t => t.id === trackId)?.title
})

const leastFavoriteTrackTitle = computed(() => {
  const trackId = albumStore.album?.review?.leastFavoriteTrackId
  if (!trackId) return null
  return albumStore.album?.tracks.find(t => t.id === trackId)?.title
})

onMounted(() => {
  collectionStore.fetchCollection()

  if (!albumStore.album?.review) {
    isRightMenuOpen.value = false
  }
})

watch(spotifyId, (id) => albumStore.fetchAlbum(id), { immediate: true })

const typeLabels: Record<string, string> = {
  album: 'Album',
  single: 'Single',
  ep: 'EP',
  compilation: 'Compilation',
}

const discs = computed(() => {
  const groups = new Map<number, NonNullable<typeof albumStore.album>['tracks']>()

  for (const track of albumStore.album?.tracks ?? []) {
    if (!groups.has(track.discNumber)) groups.set(track.discNumber, [])
    groups.get(track.discNumber)!.push(track)
  }
  return [...groups].map(([number, tracks]) => ({ number, tracks }))
})

const totalMinutes = computed(() => {
  const ms = (albumStore.album?.tracks ?? []).reduce((sum, t) => sum + (t.durationMs ?? 0), 0)
  return Math.round(ms / 60000)
})

const hasComment = computed(() => {
  return albumStore.album?.review?.comment
})

const lastModifiedDate = computed(() => {
  const lastModifiedAt = albumStore.album?.review?.lastModifiedAt
  if (!lastModifiedAt) return null

  const date = new Date(lastModifiedAt)

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date).replace(',', ' à')
})
</script>

<template>
  <div
    class="flex-col flex-1 min-w-0 min-h-0 w-full md:h-full p-4 sm:p-6 gap-6 overflow-y-auto md:rounded-large md:bg-surface-container-lowest"
    :class="isRightMenuOpen ? 'hidden md:flex' : 'flex'"
  >
    <div class="flex justify-between gap-4">
      <button
        @click="goBack"
        class="flex items-center justify-center aspect-square w-10 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-6 h-6" />
      </button>

      <div
        v-if="albumStore.album?.review" 
        class="flex gap-3"
      >
        <div class="flex gap-0.5 rounded-full overflow-hidden">
          <span
            v-if="albumStore.album?.review"
            class="flex items-center justify-center pl-4 pr-3 py-2 rounded-extra-small bg-secondary-container text-on-secondary-container label-medium"
          >
            Dans ma collection
          </span>

          <button
            @click="removeFromCollection"
            class="flex items-center justify-center pl-3 pr-4 py-2 rounded-extra-small text-on-error-container bg-error-container hover:px-4 hover:bg-error hover:text-on-error hover:rounded-full transition-all cursor-pointer"
          >
            <Trash2 class="w-6 h-6" />
          </button>
        </div>

        <button
          @click="toggleRightMenuState"
          class="flex items-center justify-center aspect-square w-10 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
        >
          <PanelRightOpen v-if="!isRightMenuOpen" class="w-6 h-6" />
          <PanelRightClose v-if="isRightMenuOpen" class="w-6 h-6" />
        </button>
      </div>

      <button
        v-else
        @click="addToCollection"
        :disabled="isAdding"
        class="flex items-center justify-center px-4 py-2 rounded-full border border-outline-variant label-medium whitespace-nowrap text-on-surface-variant cursor-pointer hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-wait"
      >
        {{ isAdding ? 'Ajout...' : 'Ajouter' }}
      </button>
    </div>

    <p
      v-if="albumStore.loading"
      class="body-medium text-on-surface-variant"
    >
      Chargement…
    </p>

    <p
      v-else-if="albumStore.error"
      class="body-medium text-error"
    >
      {{ albumStore.error }}
    </p>

    <p
      v-else-if="albumStore.notFound"
      class="body-medium text-on-surface-variant"
    >
      Cet album est introuvable.
    </p>

    <template v-else-if="albumStore.album">
      <div class="flex flex-col items-center sm:flex-row gap-6">
        <img
          v-if="albumStore.album.coverUrl"
          :src="albumStore.album.coverUrl"
          :alt="`Cover de ${albumStore.album.title}`"
          class="aspect-square w-full max-w-80 sm:w-64 rounded-large object-cover"
        />

        <div v-else class="flex items-center justify-center aspect-square w-full sm:w-64 rounded-large bg-surface-container-high">
          <EighthNotes class="w-13 h-13 text-on-surface-variant" />
        </div>

        <div class="flex flex-col justify-end py-4 gap-2 min-w-0">
          <span class="title-small text-on-surface-variant text-center sm:text-left">
            {{ typeLabels[albumStore.album.albumType] ?? 'Album' }}
          </span>
          <h1 class="headline-medium sm:display-medium text-on-surface text-center sm:text-left">
            {{ albumStore.album.title }}
          </h1>
          <span class="title-medium text-primary text-center sm:text-left">
            {{ albumStore.album.artists.join(', ') }}
          </span>
          <span class="body-medium text-on-surface-variant text-center sm:text-left">
            {{ albumStore.album.releaseYear }} • {{ albumStore.album.tracks.length }} titre{{ albumStore.album.tracks.length > 1 ? 's' : '' }}
            <template v-if="totalMinutes > 0">
              • {{ totalMinutes }} min
            </template>
          </span>
        </div>
      </div>

      <section
        v-for="disc in discs"
        :key="disc.number"
        class="flex flex-col gap-3"
      >
        <h2
          v-if="discs.length > 1"
          class="title-small text-on-surface"
        >
          Disque {{ disc.number }}
        </h2>

        <ol class="flex flex-col gap-0.5">
          <li
            v-for="(track, index) in disc.tracks"
            :key="track.spotifyId"
          >
            <TrackRow
              :class="{
                'rounded-t-large': index === 0,
                'rounded-b-large': index === disc.tracks.length - 1
              }"
              :track-number="track.trackNumber"
              :track-title="track.title"
              :artists="trackArtists(track)"
              :review="track.review"
              :is-in-collection="!!albumStore.album?.review"
              :is-favorite="albumStore.isFavoriteTrack(track.id!)"
              :is-least-favorite="albumStore.isLeastFavoriteTrack(track.id!)"
              @set-favorite="handleSetFavoriteTrack(track)"
              @set-least-favorite="handleSetLeastFavoriteTrack(track)"
              @set-rating="handleSetRating(track, $event)"
              @set-comment="handleSetTrackComment(track, $event)"
              @delete-rating="handleDeleteTrackRating(track)"
              @delete-comment="handleDeleteTrackComment(track)"
            />
          </li>
        </ol>
      </section>
    </template>
  </div>

  <!-- Review panel -->
  <div 
    v-if="isRightMenuOpen"
    class="flex flex-col flex-1 min-h-0 w-full md:w-80 md:flex-none md:h-full p-4 sm:p-6 gap-4 md:rounded-large sm:bg-surface-container-lowest overflow-y-auto"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="title-large text-on-surface">Avis sur l'album</span>

      <button
        @click="toggleRightMenuState"
        aria-label="Fermer le panneau d'avis"
        class="flex md:hidden items-center justify-center aspect-square w-10 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
      >
        <X class="w-6 h-6" />
      </button>
    </div>
    <hr class="border-outline-variant">

    <!-- Avarage rating -->
    <div class="flex flex-col items-start pb-2 gap-2">
      <span class="title-medium text-on-surface">Note moyenne</span>

      <div
        v-if="albumStore.album?.review"
        class="flex items-center justify-center w-fit px-3 py-1.5 gap-1 rounded-full bg-primary-container text-on-primary-container"
      >
        <Star class="w-4 h-4 fill-current" />

        <span 
          v-if="albumStore.averageRating"
          class="title-medium"
        >
          {{ albumStore.averageRating.toFixed(1) }}
        </span>

        <span 
          v-else
          class="title-medium"
        >
          /
        </span>
      </div>
    </div>

    <!-- Global comment -->
    <div class="flex flex-col items-start pb-2 gap-2">
      <span class="title-medium text-on-surface">Commentaire global</span>

      <div class="flex flex-col w-full gap-0.5 rounded-large overflow-hidden shrink-0">
        <div 
          v-if="!isEditingComment"
          class="flex flex-col p-4 gap-2 rounded-extra-small bg-surface-container sm:bg-surface-container-low"
        >
          <span
            v-if="!hasComment"
            class="body-medium text-on-surface-variant italic"
          >
            Pas de commentaire
          </span>

          <span
            v-else
            class="body-medium text-on-surface-variant"
          >
            {{ albumStore.album?.review?.comment }}
          </span>
        </div>

        <button
          v-if="!isEditingComment && albumStore.album?.review"
          @click="startEditing"
          class="flex items-center justify-center w-full px-4 py-3 rounded-extra-small bg-primary-container label-medium whitespace-nowrap text-on-primary-container cursor-pointer hover:bg-primary-container/80 transition-colors"
        >
          {{ hasComment ? 'Modifier le commentaire' : 'Ajouter un commentaire' }}
        </button>

        <form 
          v-else
          @submit.prevent="updateAlbumComment"
          class="flex flex-col gap-0.5"
        >
          <textarea 
            v-model="comment"
            placeholder="Écrivez votre commentaire..."
            class="flex-1 min-h-28 px-4 py-3 rounded-t-large rounded-b-extra-small border border-outline-variant bg-surface body-medium text-on-surface outline-none focus:border-primary resize-none"
          ></textarea>

          <div class="flex gap-0.5">
            <button
              type="button"
              @click="cancelEditing"
              :disabled="isUpdating"
              class="flex items-center justify-center flex-1 px-4 py-2.5 rounded-r-extra-small rounded-tl-extra-small rounded-bl-large border border-outline-variant label-medium whitespace-nowrap text-on-surface-variant cursor-pointer hover:border-error hover:text-error"
            >
              Annuler
            </button>

            <button
              type="submit"
              :disabled="isUpdating"
              class="flex items-center justify-center flex-2 px-4 py-2.5 rounded-extra-small bg-primary label-medium whitespace-nowrap text-on-primary cursor-pointer hover:bg-primary/80 disabled:opacity-50 disabled:cursor-wait"
            >
              {{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Rating distribution -->
    <div class="flex flex-col items-start pb-2 gap-2">
      <span class="title-medium text-on-surface">Répartition des notes</span>

      <div class="flex flex-col gap-0.5 rounded-large overflow-hidden shrink-0">
        <div class="flex items-end w-full h-52 p-4 gap-4 rounded-extra-small bg-surface-container sm:bg-surface-container-low">
          <RatingDistributionItem 
            v-for="cat in RATING_CATEGORIES"
            :key="cat.value"
            :rating-category="cat.value"
            :tracks-in-category="ratingDistribution.counts[cat.value] || 0"
            :max-tracks-count="ratingDistribution.maxCount"
          />
        </div>

        <div class="flex items-start justify-start flex-wrap p-4 gap-3 rounded-extra-small bg-surface-container sm:bg-surface-container-low">
          <div 
            v-for="cat in RATING_CATEGORIES"
            :key="cat.value"
            class="flex items-center justify-center w-fit gap-1.5"
          >
            <div class="w-4 h-4 rounded-full" :class="cat.colorClass" />
            <span class="body-medium text-on-surface-variant">{{ cat.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Favorite / least favorite tracks -->
    <div class="flex flex-col gap-0.5 rounded-large overflow-hidden shrink-0">
      <div class="flex items-center p-4 gap-3 rounded-extra-small bg-surface-container sm:bg-surface-container-low">
        <span
          class="flex items-center justify-center min-w-12 aspect-square rounded-medium bg-secondary-container text-on-secondary-container label-medium"
        >
          <Heart class="w-6 h-6" />
        </span>
        <span 
          v-if="albumStore.album?.review?.favoriteTrackId"
          class="body-medium text-on-surface"
        >
          {{ favoriteTrackTitle }}
        </span>
        <span 
          v-else
          class="body-medium text-on-surface-variant truncate"
        >
          /
        </span>
      </div>
      
      <div class="flex items-center p-4 gap-3 rounded-extra-small bg-surface-container sm:bg-surface-container-low">
        <span
          class="flex items-center justify-center min-w-12 aspect-square rounded-medium bg-secondary-container text-on-secondary-container label-medium"
        >
          <HeartOff class="w-6 h-6" />
        </span>
        <span 
          v-if="albumStore.album?.review?.leastFavoriteTrackId"
          class="body-medium text-on-surface"
        >
          {{ leastFavoriteTrackTitle }}
        </span>
        <span 
          v-else
          class="body-medium text-on-surface-variant"
        >
          /
        </span>
      </div>
    </div>

    <!-- Last modified at -->
    <span class="body-small text-on-surface-variant shrink-0">
      Dernière modification le {{ lastModifiedDate }}
    </span>
  </div>
</template>