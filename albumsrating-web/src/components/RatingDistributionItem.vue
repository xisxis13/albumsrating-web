<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  ratingCategory: number
  tracksInCategory: number
  maxTracksCount: number
}>()

const ratingColors: Record<number, string> = {
  5: 'bg-masterpiece',
  4: 'bg-great',
  3: 'bg-good',
  2: 'bg-mid',
  1: 'bg-skip',
}

const ratingColorClass = computed(() => ratingColors[props.ratingCategory] ?? 'bg-surface-variant')

const heightPercentage = computed(() => {
  if (props.maxTracksCount === 0 || props.tracksInCategory === 0) return 0
  return Math.round((props.tracksInCategory / props.maxTracksCount) * 100)
})
</script>

<template>
  <div class="flex flex-col items-center justify-end w-full h-full gap-2">
    <span 
      class="label-large transition-colors" 
      :class="tracksInCategory === 0 ? 'text-outline-variant' : 'text-on-surface'"
    >
      {{ tracksInCategory }}
    </span>

    <div class="relative flex items-end justify-center w-8 flex-1">
      <div 
        class="w-full rounded-small transition-all duration-300 ease-out" 
        :class="tracksInCategory === 0 ? 'bg-outline-variant' : ratingColorClass"
        :style="{ height: tracksInCategory === 0 ? '8px' : `${heightPercentage}%` }"
      />
    </div>
    
    <div class="w-3 h-3 rounded-full shrink-0" :class="ratingColorClass" />
  </div>
</template>