<script setup lang="ts">
import type { PropType } from 'vue'
import { EighthNotes } from '@lucide/vue'

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
  <div class="flex flex-col flex-1 min-w-0 p-4 gap-3 rounded-large bg-surface-container-low">
    <div class="flex flex-col flex-1 gap-2 rounded-medium">
      <img 
        v-if="album.coverUrl"
        :src="album.coverUrl" 
        :alt="`Cover de ${album.title}`"
        class="aspect-square w-full rounded-medium object-cover"
      >

      <div v-else class="flex items-center justify-center aspect-square w-full rounded-medium bg-surface-container-high">
        <EighthNotes class="w-10 h-10 text-on-surface-variant" />
      </div>

      <div class="flex flex-col flex-1">
        <span class="title-medium text-on-surface truncate">{{ album.title }}</span>
        <span class="body-medium text-on-surface-variant truncate">{{ album.artists.map((a) => a.name).join(', ') }}</span>
        <span class="body-small text-outline truncate">{{ formatYear(album.releaseDate) }} • {{ album.totalTracks }} titre{{ album.totalTracks > 1 ? 's' : '' }}</span>
      </div>
    </div>

    <span
      v-if="isInCollection"
      class="flex items-center justify-center w-full px-4 py-2 rounded-full bg-primary-container label-medium text-on-primary-container whitespace-nowrap"
    >
      Dans ma collection
    </span>

    <button
      v-else
      @click="emit('add')"
      :disabled="isAdding"
      class="flex items-center justify-center w-full px-4 py-2 rounded-full border border-outline-variant label-medium whitespace-nowrap text-on-surface-variant cursor-pointer hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-wait"
    >
      {{ isAdding ? 'Ajout...' : 'Ajouter' }}
    </button>
  </div>
</template>