<script setup lang="ts">
import type { PropType } from 'vue'

interface Artist {
  name: string,
}

interface Album {
  spotifyId: string
  title: string
  coverUrl?: string | null
  artists: Artist[]
  releaseDate: string
  totalTracks: number
}

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  album: {
    type: Object as PropType<Album>,
    required: true,
  },
  isInCollection: {
    type: Boolean,
    required: true,
  },
  isAdding: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['add'])

function formatYear(date: string) {
  return date.slice(0, 4)
}
</script>

<template>
  <div
    class="flex flex-col flex-1 min-w-0 p-4 gap-3 rounded-large bg-surface-container-low-light"  
  >
    <RouterLink
      :to="{ name: 'album', params: { spotifyId: album.spotifyId } }"
      class="flex flex-col flex-1 gap-2 rounded-medium cursor-pointer"
    >
      <img
        v-if="album.coverUrl"
        :src="album.coverUrl"
        :alt="`Pochette de ${album.title}`"
        class="aspect-square w-full rounded-medium object-cover"
      />

      <div v-else class="aspect-square w-full rounded-medium bg-surface-container-high-light" />

      <div class="flex flex-col flex-1">
        <span class="title-medium truncate">{{ album.title }}</span>
        <span class="body-medium text-on-surface-variant-light truncate">
          {{ album.artists.map((a) => a.name).join(', ') }}
        </span>
        <span class="body-small text-on-surface-variant-light">
          {{ formatYear(album.releaseDate) }} · {{ album.totalTracks }} titres
        </span>
      </div>

    </RouterLink>

    <span
      v-if="isInCollection"
      class="flex items-center justify-center w-full px-4 py-3 rounded-full bg-primary-container-light text-on-primary-container-light label-medium whitespace-nowrap"
    >
      Dans ma collection
    </span>

    <button
      v-else
      :disabled="isAdding"
      class="flex items-center justify-center w-full px-4 py-3 rounded-full border border-outline-variant-light label-medium whitespace-nowrap text-on-surface-variant-light cursor-pointer hover:border-primary-light hover:text-primary-light disabled:opacity-50 disabled:cursor-wait"
      @click="emit('add')"
    >
      {{ isAdding ? 'Ajout…' : 'Ajouter' }}
    </button>
  </div>
</template>