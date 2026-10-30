<script setup lang="ts">
import type { PropType } from 'vue'
import { EighthNotes } from '@lucide/vue'

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
  <div class="flex flex-col flex-1 min-w-0 p-4 gap-3 rounded-large bg-surface-container-low">
    <RouterLink
      :to="{ name: 'album', params: { spotifyId: album.spotifyId } }"
      class="flex flex-col flex-1 gap-2 rounded-medium cursor-pointer"
    >
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
        <span class="body-medium text-on-surface-variant truncate">{{ album.artists.join(', ') }}</span>
        <span class="body-small text-outline truncate">{{ album.releaseYear }}</span>
      </div>
    </RouterLink>

    <button
      @click="emit('remove')"
      class="flex items-center justify-center w-full px-4 py-2 rounded-full border border-outline-variant label-medium whitespace-nowrap text-on-surface-variant cursor-pointer hover:border-error hover:text-error"
    >
      Retirer
    </button>
  </div>
</template>