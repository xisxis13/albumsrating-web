<script setup lang="ts">
import type { PropType } from 'vue'

interface Album {
  spotifyId: string
  title: string
  coverUrl?: string | null
  releaseYear: number
  artists: string[]
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
})

const emit = defineEmits(['remove'])
</script>

<template>
  <div class="flex flex-col flex-1 min-w-0 p-4 gap-3 rounded-large bg-surface-container-low-light">
    <div class="flex flex-col flex-1 gap-2 rounded-medium">
      <img 
        v-if="album.coverUrl"
        :src="album.coverUrl" 
        :alt="`Cover de ${album.title}`"
        class="aspect-square w-full rounded-medium object-cover"
      >

      <div v-else class="flex items-center justify-center aspect-square w-full rounded-medium bg-surface-container-high-light">
        <EighthNotes class="w-10 h-10 text-on-surface-variant-light" />
      </div>

      <div class="flex flex-col flex-1">
        <span class="text-title-medium text-on-surface-light truncate">{{ album.title }}</span>
        <span class="text-body-medium text-on-surface-variant-light truncate">{{ album.artists.join(', ') }}</span>
        <span class="text-body-small text-on-surface-variant-light truncate">{{ album.releaseYear }}</span>
      </div>
    </div>

    <button
      @click="emit('remove')"
      class="flex items-center justify-center w-full px-4 py-2 rounded-full border border-outline-variant-light text-label-medium whitespace-nowrap text-on-surface-variant-light cursor-pointer hover:border-error-light hover:text-error-light"
    >
      Retirer
    </button>
  </div>
</template>