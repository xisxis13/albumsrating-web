<script setup lang="ts">
import { ref, computed } from 'vue'
import { Heart, HeartOff, Ellipsis } from '@lucide/vue'
import TrackMenu from './TrackMenu.vue'

import type { PropType } from 'vue'
import type { AlbumTrackReview } from '@/stores/albumDetails.ts'

const props = defineProps({
  trackNumber: {
    type: Number, 
    required: true,
  },
  trackTitle: {
    type: String, 
    required: true,
  },
  artists: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  review: { 
    type: Object as PropType<AlbumTrackReview | null>, 
    default: null 
  },
  isInCollection: {
    type: Boolean,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    required: true,
  },
  isLeastFavorite: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'set-favorite'): void
  (e: 'set-least-favorite'): void
  (e: 'set-rating', rating: number): void
  // (e: 'add-comment'): void
  (e: 'delete-rating'): void
  // (e: 'delete-comment'): void
}>()

const triggerBtn = ref<HTMLElement | null>(null)
const isMenuOpen = ref(false)

const ratingColors: Record<number, string> = {
  5: 'bg-masterpiece',
  4: 'bg-great',
  3: 'bg-good',
  2: 'bg-mid',
  1: 'bg-skip',
}

const ratingColorClass = computed(() => {
  if (!props.review?.rating) return null
  return ratingColors[props.review.rating] ?? null
})
</script>

<template>
  <div class="flex items-center px-4 py-2.5 gap-3 rounded-extra-small bg-surface-container-low">
    <span class="w-5 text-center title-small text-on-surface-variant">
      {{ trackNumber }}
    </span>

    <div class="flex-1 flex flex-col justify-center min-h-7 gap-0.5">
      <span class="body-medium text-on-surface">{{ trackTitle }}</span>
      <span
        v-if="artists.length"
        class="body-small text-outline"
      >
        {{ artists.join(', ') }}
      </span>
    </div>
    
    <div
      v-if="isInCollection"
      class="flex items-center"
    >
      <div v-if="isFavorite" class="flex items-center justify-center w-8 h-8">
        <Heart class="w-5 h-5 text-outline" />
      </div>

      <div v-if="isLeastFavorite" class="flex items-center justify-center w-8 h-8">
        <HeartOff class="w-5 h-5 text-outline" />
      </div>

      <div v-if="ratingColorClass" class="flex items-center justify-center w-8 h-8">
        <div class="w-3.5 h-3.5 rounded-full" :class="ratingColorClass"></div>
      </div>
      
      <button
        ref="triggerBtn"
        type="button"
        @click="isMenuOpen = !isMenuOpen"
        class="flex items-center justify-center aspect-square w-8 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
      >
        <Ellipsis class="w-6 h-6" />
      </button>

      <TrackMenu
        v-if="isMenuOpen"
        :target-el="triggerBtn"
        @close="isMenuOpen = false"
        @set-favorite="emit('set-favorite')"
        @set-least-favorite="emit('set-least-favorite')"
        @set-rating="emit('set-rating', $event)"
        @delete-rating="emit('delete-rating')"
      />
    </div>

    <!--
      @add-comment="emit('add-comment')"
      @delete-comment="emit('delete-comment')" 
    -->
  </div>
</template>