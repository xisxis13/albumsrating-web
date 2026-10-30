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
} from '@lucide/vue'
import NavigationRail from '@/components/NavigationRail.vue'
import TrackRow from '@/components/TrackRow.vue'

import type { AlbumTrack  } from '@/stores/albumDetails'

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

async function handleSetFavoriteTrack(track: AlbumTrack) {
  albumStore.setFavoriteTrack(track.id!!)
}

async function handleSetLeastFavoriteTrack(track: AlbumTrack) {
  albumStore.setLeastFavoriteTrack(track.id!!)
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
  <main class="flex items-center justify-center h-dvh p-3 gap-3">
    <NavigationRail />

    <div class="flex flex-col w-full h-full p-6 gap-6 overflow-scroll rounded-large bg-surface-container-lowest">
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
          <span
            v-if="albumStore.album?.review"
            class="flex items-center justify-center px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container label-medium"
          >
            Dans ma collection
          </span>

          <button
            @click="removeFromCollection"
            class="flex items-center justify-center aspect-square w-10 rounded-full text-on-error-container bg-error-container hover:bg-error hover:text-on-error transition-colors cursor-pointer"
          >
            <Trash2 class="w-6 h-6" />
          </button>

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
        <div class="flex flex-col sm:flex-row gap-6">
          <img
            v-if="albumStore.album.coverUrl"
            :src="albumStore.album.coverUrl"
            :alt="`Cover de ${albumStore.album.title}`"
            class="aspect-square w-full sm:w-64 rounded-large object-cover"
          />

          <div v-else class="flex items-center justify-center aspect-square w-full sm:w-64 rounded-large bg-surface-container-high">
            <EighthNotes class="w-13 h-13 text-on-surface-variant" />
          </div>

          <div class="flex flex-col justify-end gap-2 min-w-0">
            <span class="title-medium text-on-surface-variant">
              {{ typeLabels[albumStore.album.albumType] ?? 'Album' }}
            </span>
            <h1 class="display-medium text-on-surface">
              {{ albumStore.album.title }}
            </h1>
            <span class="title-large text-primary">
              {{ albumStore.album.artists.join(', ') }}
            </span>
            <span class="body-medium text-outline">
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
                :is-in-collection="albumStore.album.review !== null"
                :is-favorite="albumStore.isFavoriteTrack(track.id!!)"
                :is-least-favorite="albumStore.isLeastFavoriteTrack(track.id!!)"
                @set-favorite="handleSetFavoriteTrack(track)"
                @set-least-favorite="handleSetLeastFavoriteTrack(track)"
              />
            </li>
          </ol>
        </section>
      </template>
    </div>

    <div 
      v-if="isRightMenuOpen"
      class="flex flex-col min-w-80 w-fit h-full p-6 gap-4 rounded-large bg-surface-container-lowest overflow-scroll"
    >
      <div class="flex flex-col gap-0.5 rounded-large overflow-hidden">
        <div class="flex items-center p-3 gap-3 rounded-extra-small bg-surface-container-low">
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
        
        <div class="flex items-center p-3 gap-3 rounded-extra-small bg-surface-container-low">
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

      <span class="body-medium text-on-surface-variant">
        Dernière modification le {{ lastModifiedDate }}
      </span>
    </div>
  </main>
</template>