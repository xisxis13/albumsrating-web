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
          {{ album.artists.join(', ') }}
        </span>
        <span class="body-small text-on-surface-variant-light">
          {{ album.releaseYear }} titres
        </span>
      </div>
    </RouterLink>

    <button
      class="flex items-center justify-between w-full px-4 py-2 rounded-full border border-outline-variant-light text-on-surface-variant-light cursor-pointer hover:border-error-light hover:text-error-light"
      @click="emit('remove')"
    >
      <span
        class="w-full label-medium"
      >
        Retirer
      </span>
    </button>
  </div>
</template>