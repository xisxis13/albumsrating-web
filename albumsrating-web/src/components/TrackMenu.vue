<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'
import { onClickOutside } from '@vueuse/core'
import {
  Heart,
  HeartOff,
  Star,
  Plus,
  Trash2,
  ChevronRight
} from '@lucide/vue'

const props = defineProps<{
  targetEl: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'set-favorite'): void
  (e: 'set-least-favorite'): void
  (e: 'set-rating', rating: number): void
  // (e: 'add-comment'): void
  // (e: 'delete-rating'): void
  // (e: 'delete-comment'): void
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

const isRatingsOpen = ref(false)
const ratingTriggerRef = ref<HTMLElement | null>(null)
const ratingMenuRef = ref<HTMLElement | null>(null)

const { floatingStyles: ratingFloatingStyles } = useFloating(
  ratingTriggerRef,
  ratingMenuRef,
  {
    strategy: 'fixed',
    placement: 'right-start',
    middleware: [
      offset(8),
      flip({ fallbackPlacements: ['left-start', 'bottom-start'] }),
      shift({ padding: 12 })
    ],
    whileElementsMounted: autoUpdate
  }
)

onClickOutside(mainMenuRef, () => emit('close'), {
  ignore: [targetRef, ratingMenuRef]
})

const ratings = [
  { label: 'Incroyable', value: 5, color: 'bg-masterpiece' },
  { label: 'Très bien', value: 4, color: 'bg-great' },
  { label: 'Bien', value: 3, color: 'bg-good' },
  { label: 'Moyen', value: 2, color: 'bg-mid' },
  { label: 'À zapper', value: 1, color: 'bg-skip' }
]

function handleSelectRating(value: number) {
  emit('set-rating', value)
  isRatingsOpen.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <!-- Main menu -->
    <div
      ref="mainMenuRef"
      :style="mainFloatingStyles"
      class="flex flex-col z-50 w-56 gap-0.5 rounded-medium select-none"
    >
      <div class="grid grid-cols-2 p-1 gap-1 rounded-t-medium rounded-b-extra-small bg-tertiary-container shadow-xl shadow-[#47464F]/20">
        <button
          type="button"
          @click="emit('set-favorite')"
          class="flex flex-col items-center justify-center p-2 gap-2 rounded-small hover:bg-on-tertiary-container/10 transition-colors cursor-pointer"
        >
          <Heart class="w-6 h-6 text-on-tertiary-container" />
          <span class="label-medium text-on-tertiary-container">
            Définir comme favori
          </span>
        </button>

        <button
          type="button"
          @click="emit('set-least-favorite')"
          class="flex flex-col items-center justify-center p-2 gap-2 rounded-small hover:bg-on-tertiary-container/10 transition-colors cursor-pointer"
        >
          <HeartOff class="w-6 h-6 text-on-tertiary-container" />
          <span class="label-medium text-on-tertiary-container">
            Définir comme moins aimé
          </span>
        </button>
      </div>

      <div class="flex flex-col p-1 gap-1 rounded-t-extra-small rounded-b-medium bg-tertiary-container shadow-xl shadow-[#47464F]/20">
        <button
          ref="ratingTriggerRef"
          type="button"
          @click="isRatingsOpen = !isRatingsOpen"
          class="flex items-center justify-between w-full px-3 py-2 rounded-small transition-all cursor-pointer"
          :class="isRatingsOpen ? 'bg-tertiary text-on-tertiary hover:bg-tertiary/80' : 'text-on-tertiary-container hover:bg-on-tertiary-container/10'"
        >
          <div class="flex items-center gap-3">
            <Star class="w-5 h-5" />
            <span class="label-large text-left">Modifier la note</span>
          </div>
          <ChevronRight
            class="w-5 h-5 transition-transform duration-200"
            :class="{ 'rotate-90': isRatingsOpen }"
          />
        </button>

        <!-- <button
          type="button"
          @click="emit('add-comment')"
          class="flex items-center w-full px-3 py-2 gap-3 rounded-small text-on-tertiary-container hover:bg-on-tertiary-container/10 transition-colors cursor-pointer"
        >
          <Plus class="w-5 h-5" />
          <span class="label-large text-left">Ajouter un commentaire</span>
        </button> -->
      </div>

      <!-- <div class="flex flex-col p-1 gap-1 rounded-b-medium rounded-t-extra-small bg-tertiary-container shadow-xl shadow-[#47464F]/20">
        <button
          type="button"
          @click="emit('delete-rating')"
          class="flex items-center w-full px-3 py-2 gap-3 rounded-small text-error hover:bg-on-tertiary-container/10 transition-colors cursor-pointer"
        >
          <Trash2 class="w-5 h-5" />
          <span class="label-large text-left">Supprimer la note</span>
        </button>

        <button
          type="button"
          @click="emit('delete-comment')"
          class="flex items-center w-full px-3 py-2 gap-3 rounded-small text-error hover:bg-on-tertiary-container/10 transition-colors cursor-pointer"
        >
          <Trash2 class="w-5 h-5" />
          <span class="label-large text-left">Supprimer le commentaire</span>
        </button>
      </div> -->
    </div>

    <!-- Sub menu : rating -->
    <div
      v-if="isRatingsOpen"
      ref="ratingMenuRef"
      :style="ratingFloatingStyles"
      class="flex flex-col z-50 w-44 p-1 gap-0.5 rounded-medium bg-tertiary-container shadow-xl shadow-[#47464F]/20 select-none"
    >
      <button
        v-for="rating in ratings"
        :key="rating.label"
        type="button"
        @click="handleSelectRating(rating.value)"
        class="flex items-center w-full px-3 py-2 gap-3 rounded-small text-on-tertiary-container hover:bg-on-tertiary-container/10 transition-colors cursor-pointer"
      >
        <span class="w-4 h-4 rounded-full shrink-0" :class="rating.color" />
        <span class="body-medium">
          {{ rating.label }}
        </span>
      </button>
    </div>
  </Teleport>
</template>