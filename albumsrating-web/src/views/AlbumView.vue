<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAlbumDetailStore } from '@/stores/albumDetail'
import { useCollectionStore } from '@/stores/collection'
import type { AlbumTrack } from '@/stores/albumDetail'
import { ArrowLeft, Pen } from 'lucide-vue-next'
import NavigationRail from '@/components/NavigationRail.vue'
import TrackItem from '@/components/TrackItem.vue'

const route = useRoute()
const router = useRouter()
const albumStore = useAlbumDetailStore()
const collectionStore = useCollectionStore()

const spotifyId = computed(() => String(route.params.spotifyId))

const isEditingComment = ref(false)
const isUpdating = ref(false)
const comment = ref('')

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/collection')
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

function startEditing() {
  comment.value = albumStore.album?.review?.comment || ''
  isEditingComment.value = true
}

function cancelEditing() {
  isEditingComment.value = false
  comment.value = ''
}

async function updateComment() {
  const reviewId = albumStore.album?.review?.id
  if (!reviewId) return

  try {
    isUpdating.value = true
    const newCommentValue = comment.value.trim() || null
    await albumStore.updateComment(reviewId, newCommentValue)
    
    if (albumStore.album && albumStore.album.review) {
      albumStore.album.review.comment = newCommentValue
    }
  } catch (error) {
    console.error("Erreur lors de la modification du commantaire.", error)
  } finally {
    isUpdating.value = false
    cancelEditing()
  }
}

onMounted(() => {
  collectionStore.fetchCollection()
})

watch(spotifyId, (id) => albumStore.fetchAlbum(id), { immediate: true })

const hasComment = computed(() => {
  return albumStore.album?.review?.comment
})

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
</script>

<template>
  <main class="flex items-center justify-center h-dvh p-3 gap-3 bg-surface">
    <NavigationRail />
    
    <div class="flex flex-col w-full h-full p-6 gap-6 rounded-large bg-surface-container-lowest overflow-scroll">
      <button
        class="flex items-center w-fit p-1 gap-2 rounded-full cursor-pointer hover:bg-surface-container"
        @click="goBack"
      >
        <ArrowLeft class="text-on-surface" />
      </button>

      <p v-if="albumStore.loading" class="body-medium text-on-surface-variant">
        Chargement…
      </p>

      <p v-else-if="albumStore.error" class="body-medium text-error">
        {{ albumStore.error }}
      </p>

      <p v-else-if="albumStore.notFound" class="body-medium text-on-surface-variant">
        Cet album est introuvable.
      </p>

      <template v-else-if="albumStore.album">
        <div class="flex flex-col sm:flex-row gap-6">
          <img
            v-if="albumStore.album.coverUrl"
            :src="albumStore.album.coverUrl"
            :alt="`Pochette de ${albumStore.album.title}`"
            class="aspect-square w-full sm:w-64 rounded-large object-cover"
          />
          <div v-else class="aspect-square w-full sm:w-64 rounded-large bg-surface-container-high" />

          <div class="flex flex-col justify-end gap-2 min-w-0">
            <span class="text-title-medium text-on-surface-variant">
              {{ typeLabels[albumStore.album.albumType] ?? 'Album' }}
            </span>
            <h1 class="display-medium text-on-surface">{{ albumStore.album.title }}</h1>
            <span class="title-large text-primary">
              {{ albumStore.album.artists.join(', ') }}
            </span>
            <span class="body-medium text-on-surface-variant">
              {{ albumStore.album.releaseYear }} · {{ albumStore.album.tracks.length }} titres
              <template v-if="totalMinutes > 0"> · {{ totalMinutes }} min</template>
            </span>

            <div class="mt-2">
              <span
                v-if="albumStore.album.review"
                class="inline-block px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container label-medium"
              >
                Dans ma collection
              </span>
              <button
                v-else
                :disabled="collectionStore.isAdding(albumStore.album.spotifyId)"
                class="px-4 py-2 rounded-full bg-primary text-on-primary label-medium cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                @click="addToCollection"
              >
                {{ collectionStore.isAdding(albumStore.album.spotifyId) ? 'Ajout…' : 'Ajouter à ma collection' }}
              </button>
            </div>
          </div>
        </div>

        <section v-for="disc in discs" :key="disc.number" class="flex flex-col gap-3">
          <h2 v-if="discs.length > 1" class="title-small text-on-surface">
            Disque {{ disc.number }}
          </h2>

          <ol class="flex flex-col gap-0.5 rounded-large overflow-hidden">
            <li
              v-for="track in disc.tracks"
              :key="track.spotifyId"
            >
              <TrackItem 
                :track-number="track.trackNumber"
                :track-title="track.title"
                :artists="trackArtists(track)"
              />
            </li>
          </ol>
        </section>
      </template>
    </div>

    <div v-if="albumStore.album?.review" class="flex flex-col min-w-80 w-fit h-full p-6 gap-4 rounded-large bg-surface-container-lowest overflow-scroll">
      <div class="flex flex-col w-full gap-3">
        <h1 class="text-title-large text-on-surface">Commentaire global</h1>
        
        <div v-if="!isEditingComment" class="flex flex-col gap-3">
          <span 
            v-if="!hasComment"
            class="text-body-medium text-on-surface-variant italic"
          >
            Pas de commentaire
          </span>
          <span 
            v-else
            class="text-body-medium text-on-surface"
          >
            {{ albumStore.album?.review?.comment }}
          </span>

          <button
            v-if="albumStore.album?.review"
            class="flex items-center justify-center w-full mt-2 px-4 py-3 rounded-full border border-outline-variant label-medium whitespace-nowrap text-on-surface-variant cursor-pointer hover:border-primary hover:text-primary transition-colors"
            @click="startEditing"
          >
            {{ hasComment ? 'Modifier le commentaire' : 'Ajouter un commentaire' }}
          </button>
        </div>

        <form v-else class="flex flex-col gap-3" @submit.prevent="updateComment">
          <textarea
            v-model="comment"
            placeholder="Écrivez votre commentaire..."
            class="flex-1 min-h-28 px-4 py-3 rounded-large border border-outline-variant bg-surface body-medium text-on-surface outline-none focus:border-primary resize-none"
          ></textarea>

          <div class="flex gap-2 mt-2">
            <button
              type="button"
              class="flex-1 px-4 py-3 rounded-full border border-outline-variant text-on-surface-variant label-large cursor-pointer hover:bg-surface-container"
              @click="cancelEditing"
              :disabled="isUpdating"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              class="flex-1 px-4 py-3 rounded-full bg-primary text-on-primary label-large cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>