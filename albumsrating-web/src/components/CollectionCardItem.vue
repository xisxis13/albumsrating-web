<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { EighthNotes, Star } from '@lucide/vue'

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
  averageRating: {
    type: Number,
    default: null,
  },
  ratedTracks: {
    type: Number,
    required: true,
  },
  totalTracks: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['remove'])

const ratingProgress = computed(() => {
  if (!props.totalTracks) return 0
  return Math.round((props.ratedTracks / props.totalTracks) * 100)
})

const circleRadius = 14
const circleCircumference = 2 * Math.PI * circleRadius

const strokeDashoffset = computed(() => {
  return circleCircumference - (ratingProgress.value / 100) * circleCircumference
})
</script>

<template>
  <div class="flex flex-col flex-1 min-w-0 p-3 sm:p-4 gap-3 rounded-large bg-surface-container sm:bg-surface-container-low">
    <RouterLink
      :to="{ name: 'album', params: { spotifyId: album.spotifyId } }"
      class="flex flex-col flex-1 gap-2 rounded-medium cursor-pointer"
    >
      <div class="aspect-square w-full rounded-medium overflow-hidden">
        <img 
          v-if="album.coverUrl"
          :src="album.coverUrl" 
          :alt="`Cover de ${album.title}`"
          class="aspect-square w-full object-cover"
        >
  
        <div v-else class="flex items-center justify-center aspect-square w-full bg-surface-container-high">
          <EighthNotes class="w-10 h-10 text-on-surface-variant" />
        </div>
      </div>

      <div class="flex flex-col flex-1">
        <span class="title-medium text-on-surface truncate">{{ album.title }}</span>
        <span class="body-medium text-on-surface-variant truncate">{{ album.artists.join(', ') }}</span>
        <span class="body-small text-outline truncate">{{ album.releaseYear }}</span>
      </div>

      <div class="flex items-center justify-between w-full">
        <div
          class="flex items-center justify-center w-fit px-2 py-1 gap-1 rounded-full bg-primary-container text-on-primary-container"
        >
          <Star class="w-3.5 h-3.5 fill-current" />

          <span 
            v-if="averageRating"
            class="label-large"
          >
            {{ averageRating.toFixed(1) }}
          </span>

          <span 
            v-else
            class="label-large"
          >
            /
          </span>
        </div>

        <div
          class="flex items-center justify-center w-fit px-2 py-1 gap-1 rounded-full bg-primary-container text-on-primary-container"
        >
          <svg class="w-4 h-4 -rotate-90 shrink-0" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              :r="circleRadius"
              fill="none"
              class="stroke-on-primary-container/20"
              stroke-width="6"
            />
            <circle
              cx="18"
              cy="18"
              :r="circleRadius"
              fill="none"
              class="stroke-primary transition-all duration-500 ease-out"
              stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="circleCircumference"
              :stroke-dashoffset="strokeDashoffset"
            />
          </svg>

          <span class="label-large">
            {{ ratingProgress }}%
          </span>
        </div>
      </div>
    </RouterLink>

    <button
      @click="emit('remove')"
      class="flex items-center justify-center w-full px-4 py-2 rounded-full border border-outline-variant label-small sm:label-medium whitespace-nowrap text-on-surface-variant cursor-pointer hover:border-error hover:text-error"
    >
      Retirer
    </button>
  </div>
</template>