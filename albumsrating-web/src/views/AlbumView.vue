<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAlbumDetailStore } from '@/stores/albumDetail'
import { useCollectionStore } from '@/stores/collection'

const route = useRoute()
const router = useRouter()
const albumStore = useAlbumDetailStore()
const collectionStore = useCollectionStore()

const spotifyId = computed(() => String(route.params.spotifyId))

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/collection')
}

onMounted(() => {
  collectionStore.fetchCollection()
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

function formatDuration(ms: number | null) {
  if (ms === null) return ''
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
</script>

<template>
  <main class="flex flex-col items-center min-h-dvh p-3 bg-surface-light">
    <div class="flex flex-col w-full max-w-2xl p-6 gap-6 rounded-large bg-surface-container-lowest-light">
      <button
        class="self-start label-large text-on-surface-variant-light hover:text-on-surface-light cursor-pointer"
        @click="goBack"
      >
        ← Retour
      </button>

      <p v-if="albumStore.loading" class="body-medium text-on-surface-variant-light">
        Chargement…
      </p>

      <p v-else-if="albumStore.error" class="body-medium text-error-light">
        {{ albumStore.error }}
      </p>

      <p v-else-if="albumStore.notFound" class="body-medium text-on-surface-variant-light">
        Cet album est introuvable.
      </p>

      <template v-else-if="albumStore.album">
        <div class="flex flex-col sm:flex-row gap-6">
          <img
            v-if="albumStore.album.coverUrl"
            :src="albumStore.album.coverUrl"
            :alt="`Pochette de ${albumStore.album.title}`"
            class="aspect-square w-full sm:w-48 rounded-medium object-cover"
          />
          <div v-else class="aspect-square w-full sm:w-48 rounded-medium bg-surface-container-high-light" />

          <div class="flex flex-col justify-end gap-2 min-w-0">
            <span class="label-medium text-on-surface-variant-light">
              {{ typeLabels[albumStore.album.albumType] ?? 'Album' }}
            </span>
            <h1 class="headline-small">{{ albumStore.album.title }}</h1>
            <span class="body-large text-on-surface-variant-light">
              {{ albumStore.album.artists.join(', ') }}
            </span>
            <span class="body-medium text-on-surface-variant-light">
              {{ albumStore.album.releaseYear }} · {{ albumStore.album.tracks.length }} titres
              <template v-if="totalMinutes > 0"> · {{ totalMinutes }} min</template>
            </span>

            <div class="mt-2">
              <span
                v-if="collectionStore.has(albumStore.album.spotifyId)"
                class="inline-block px-4 py-2 rounded-full bg-secondary-container-light text-on-secondary-container-light label-medium"
              >
                Dans ma collection
              </span>
              <button
                v-else
                :disabled="collectionStore.isAdding(albumStore.album.spotifyId)"
                class="px-4 py-2 rounded-full bg-primary-light text-on-primary-light label-medium cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                @click="collectionStore.addAlbum(albumStore.album.spotifyId)"
              >
                {{ collectionStore.isAdding(albumStore.album.spotifyId) ? 'Ajout…' : 'Ajouter à ma collection' }}
              </button>
            </div>
          </div>
        </div>

        <section v-for="disc in discs" :key="disc.number" class="flex flex-col gap-1">
          <h2 v-if="discs.length > 1" class="title-small mt-2 text-on-surface-variant-light">
            Disque {{ disc.number }}
          </h2>

          <ol class="flex flex-col">
            <li
              v-for="track in disc.tracks"
              :key="track.spotifyId"
              class="flex items-center gap-4 px-3 py-3 rounded-small hover:bg-surface-container-low-light"
            >
              <span class="w-6 text-right body-medium text-on-surface-variant-light">
                {{ track.trackNumber }}
              </span>
              <span class="flex-1 body-large truncate">{{ track.title }}</span>
              <span class="body-medium text-on-surface-variant-light">
                {{ formatDuration(track.durationMs) }}
              </span>
            </li>
          </ol>
        </section>
      </template>
    </div>
  </main>
</template>