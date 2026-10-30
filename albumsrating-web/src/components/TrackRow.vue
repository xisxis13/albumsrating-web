<script setup lang="ts">
import type { PropType } from 'vue'

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
})
</script>

<template>
  <div class="flex items-center px-4 py-3 gap-3 rounded-extra-small bg-surface-container-low">
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
  </div>
</template>