<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'
import { onClickOutside } from '@vueuse/core'
import { Heart, HeartOff } from '@lucide/vue'

const props = defineProps<{
  targetEl: HTMLElement | null
  isFavorite: boolean
  isLeastFavorite: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'set-favorite'): void
  (e: 'set-least-favorite'): void
}>()

const targetRef = toRef(props, 'targetEl')

const mainMenuRef = ref<HTMLElement | null>(null)
const { floatingStyles: mainFloatingStyles } = useFloating(
  targetRef,
  mainMenuRef,
  {
    strategy: 'fixed',
    placement: 'bottom-end',
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 12 })
    ],
    whileElementsMounted: autoUpdate
  }
)

onClickOutside(mainMenuRef, () => emit('close'), { ignore: [targetRef] })
</script>

<template>
  <Teleport to="body">
    <!-- Main menu -->
    <div
      ref="mainMenuRef"
      :style="mainFloatingStyles"
      class="flex flex-col z-50 w-56 gap-0.5 rounded-medium select-none"
    >
      <div class="grid grid-cols-2 p-1 gap-1 rounded-medium bg-tertiary-container shadow-xl shadow-[#47464F]/20">
        <button
          type="button"
          @click="emit('set-favorite'); emit('close')"
          class="flex flex-col items-center justify-center p-2 gap-2 rounded-small hover:bg-on-tertiary-container/10 transition-colors cursor-pointer"
        >
          <Heart v-if="!isFavorite" class="w-6 h-6 text-on-tertiary-container" />
          <HeartOff v-else class="w-6 h-6 text-on-tertiary-container" />
          <span class="label-medium text-on-tertiary-container">
            {{ isFavorite ? 'Retirer des favoris' : 'Définir comme favori' }}
          </span>
        </button>

        <button
          type="button"
          @click="emit('set-least-favorite'); emit('close')"
          class="flex flex-col items-center justify-center p-2 gap-2 rounded-small hover:bg-on-tertiary-container/10 transition-colors cursor-pointer"
        >
          <HeartOff v-if="!isLeastFavorite" class="w-6 h-6 text-on-tertiary-container" />
          <Heart v-else class="w-6 h-6 text-on-tertiary-container" />
          <span class="label-medium text-on-tertiary-container">
            {{ isLeastFavorite ? 'Retirer des moins aimés' : 'Définir comme moins aimé' }}
          </span>
        </button>
      </div>
    </div>
  </Teleport>
</template>