<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: [Object, Function, String],
    required: true,
  },
})

const route = useRoute()

const isActive = computed(() => route.path === props.to)
</script>

<template>
  <RouterLink
    :to="to"
    class="flex flex-col items-center w-full px-1 py-1.5 gap-1 transition-colors duration-200"
    :title="label"
  >
    <div 
      class="flex items-center justify-center w-14 h-8 rounded-full"
      :class="isActive ? 'bg-primary-container-light' : 'bg-transparent'"
    >
      <component 
        :is="icon" 
        class="w-5 h-5" 
        :class="isActive ? 'text-on-primary-container-light' : 'text-on-surface-variant-light'"
      />
    </div>
    
    <span 
      class="label-medium"
      :class="isActive ? 'text-on-primary-container-light' : 'text-on-surface-variant-light'"
    >
      {{ label }}
    </span>
  </RouterLink>
</template>