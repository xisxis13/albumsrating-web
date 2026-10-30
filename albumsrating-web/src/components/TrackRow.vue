<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'
import { Heart, HeartOff, Ellipsis } from '@lucide/vue'
import TrackMenu from './TrackMenu.vue'

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
  // (e: 'set-rating', rating: number): void
  // (e: 'add-comment'): void
  // (e: 'delete-rating'): void
  // (e: 'delete-comment'): void
}>()

const triggerBtn = ref<HTMLElement | null>(null)
const isMenuOpen = ref(false)
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

    
    <div class="flex items-center gap-2">
      <Heart v-if="isFavorite" class="w-5 h-5 text-outline" />
      <HeartOff v-if="isLeastFavorite" class="w-5 h-5 text-outline" />
      
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
      />
    </div>

    <!-- 
      @set-rating="emit('set-rating')"
      @add-comment="emit('add-comment')"
      @delete-rating="emit('delete-rating')"
      @delete-comment="emit('delete-comment')" 
    -->
  </div>
</template>