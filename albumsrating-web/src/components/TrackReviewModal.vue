<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

import { X, Trash2, ChevronDown } from '@lucide/vue'

import type { PropType } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
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
  initialComment: {
    type: String as PropType<string | null>,
    default: null,
  },
  initialRating: {
    type: Number as PropType<number | null>,
    default: null,
  },
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save-comment', comment: string | null): void
  (e: 'set-rating', rating: number): void
  (e: 'delete-rating'): void
  (e: 'delete-comment'): void
}>()

const ratings = [
  { label: 'Incroyable', value: 5, color: 'bg-masterpiece' },
  { label: 'Très bien', value: 4, color: 'bg-great' },
  { label: 'Bien', value: 3, color: 'bg-good' },
  { label: 'Moyen', value: 2, color: 'bg-mid' },
  { label: 'À zapper', value: 1, color: 'bg-skip' }
]

const commentText = ref('')
const isSaving = ref(false)
const isEditingComment = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const selectedValue = ref<number | null>(null)
const hasComment = computed(() => !!props.initialComment)

function adjustHeight() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
    }
  })
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      isEditingComment.value = false
      commentText.value = props.initialComment || ''
      selectedValue.value = props.initialRating
      adjustHeight()
    }
  },
  { immediate: true }
)

watch(commentText, () => {
  adjustHeight()
})

function handleClose() {
  if (isSaving.value) return
  emit('close')
}

function startEditing() {
  commentText.value = props.initialComment || ''
  isEditingComment.value = true
}

function cancelEditing() {
  isEditingComment.value = false
  commentText.value = ''
}

function handleRatingChange() {
  if (selectedValue.value !== null) {
    emit('set-rating', selectedValue.value)
  }
}

function handleDeleteRating() {
  selectedValue.value = null
  emit('delete-rating')
}

async function handleSubmit() {
  isSaving.value = true
  const value = commentText.value.trim() || null
  emit('save-comment', value)
  isSaving.value = false
  isEditingComment.value = false
  // emit('close')
}

function handleDeleteComment() {
  if (isSaving.value) return
  emit('delete-comment')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-scrim backdrop-blur-xs"
      @click.self="handleClose"
    >
      <div
        class="flex flex-col w-full max-w-130 p-6 gap-4 rounded-large bg-surface-container-low shadow-xl"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between flex-1">
          <div class="flex flex-col w-full gap-0.5">
            <span class="title-large text-on-surface">{{ trackTitle }}</span>
            <span v-if="artists.length > 0" class="body-medium text-on-surface-variant">{{ artists.join(', ') }}</span>
          </div>

          <button
            @click="handleClose"
            class="flex items-center justify-center aspect-square w-10 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <hr class="border-outline-variant">

        <!-- Rating -->
        <div class="flex flex-col items-start pb-2 gap-2">
          <span class="title-medium text-on-surface">Note</span>

          <div class="flex w-fit gap-0.5 rounded-full overflow-hidden">
            <div class="relative flex items-center w-52">
              <span
                v-if="selectedValue !== null"
                class="absolute left-4 w-4 h-4 rounded-full pointer-events-none"
                :class="ratings.find(r => r.value === selectedValue)?.color"
              />
              <select
                v-model="selectedValue"
                @change="handleRatingChange"
                :class="[
                  'w-full pr-11 py-3 rounded-extra-small bg-surface-container-high body-medium appearance-none cursor-pointer focus:rounded-l-full',
                  selectedValue === null ? 'pl-4' : 'pl-11',
                ]"
              >
                <option :value="null" disabled>Sélectionner une note</option>
                <option v-for="rating in ratings" :key="rating.value" :value="rating.value">
                  {{ rating.label }}
                </option>
              </select>

              <ChevronDown class="absolute right-4 w-5 h-5 text-on-surface-variant" />
            </div>
    
            <button
              type="button"
              @click="handleDeleteRating"
              class="flex items-center justify-center pl-3 pr-4 py-2 rounded-extra-small text-on-error-container bg-error-container hover:px-4 hover:bg-error hover:text-on-error hover:rounded-full transition-all cursor-pointer"
            >
              <Trash2 class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Comment -->
        <div class="flex flex-col items-start pb-2 gap-2">
          <span class="title-medium text-on-surface">Commentaire du titre</span>

          <div class="flex flex-col w-full gap-0.5 rounded-large overflow-hidden shrink-0">
            <div 
              v-if="!isEditingComment"
              class="flex flex-col p-4 gap-2 rounded-extra-small bg-surface-container sm:bg-surface-container-high"
            >
              <span
                v-if="!hasComment"
                class="body-medium text-on-surface-variant italic"
              >
                Pas de commentaire
              </span>

              <span
                v-else
                class="body-medium text-on-surface-variant"
              >
                {{ props.initialComment }}
              </span>
            </div>

            <div v-if="!isEditingComment" class="flex gap-0.5">
              <button
                v-if="hasComment"
                @click="handleDeleteComment"
                class="flex flex-1 items-center justify-center px-4 py-2 rounded-extra-small text-on-error-container bg-error-container hover:bg-error hover:text-on-error transition-all cursor-pointer"
              >
                <Trash2 class="w-6 h-6" />
              </button>

              <button
                @click="startEditing"
                class="flex flex-3 items-center justify-center px-4 py-3 rounded-extra-small bg-primary-container label-medium whitespace-nowrap text-on-primary-container cursor-pointer hover:bg-primary-container/80 transition-colors"
              >
                {{ hasComment ? 'Modifier le commentaire' : 'Ajouter un commentaire' }}
              </button>
            </div>

            <form 
              v-else
              @submit.prevent="handleSubmit"
              class="flex flex-col gap-0.5"
            >
              <textarea 
                ref="textareaRef"
                v-model="commentText"
                placeholder="Écrivez votre commentaire..."
                rows="1"
                class="flex-1 min-h-28 max-h-60 px-4 py-3 rounded-t-large rounded-b-extra-small border border-outline-variant bg-surface body-medium text-on-surface outline-none focus:border-primary resize-none overflow-y-auto"
              ></textarea>

              <div class="flex gap-0.5">
                <button
                  type="button"
                  @click="cancelEditing"
                  class="flex items-center justify-center flex-1 px-4 py-2.5 rounded-r-extra-small rounded-tl-extra-small rounded-bl-large border border-outline-variant label-medium whitespace-nowrap text-on-surface-variant cursor-pointer hover:border-error hover:text-error"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  :disabled="isSaving"
                  class="flex items-center justify-center flex-2 px-4 py-2.5 rounded-extra-small bg-primary label-medium whitespace-nowrap text-on-primary cursor-pointer hover:bg-primary/80 disabled:opacity-50 disabled:cursor-wait"
                >
                  {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>