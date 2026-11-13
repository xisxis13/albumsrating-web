<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X } from '@lucide/vue'

const props = defineProps<{
  isOpen: boolean
  trackTitle: string
  initialComment: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', comment: string | null): void
}>()

const commentText = ref('')
const isSaving = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

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
      commentText.value = props.initialComment || ''
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

async function handleSubmit() {
  isSaving.value = true
  const value = commentText.value.trim() || null
  emit('save', value)
  isSaving.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim backdrop-blur-xs"
      @click.self="handleClose"
    >
      <div
        class="flex flex-col w-full max-w-130 p-6 gap-4 rounded-large bg-surface-container-low shadow-xl"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between flex-1">
          <div class="flex flex-col w-full">
            <span class="label-medium text-on-surface-variant">Commentaire du titre</span>
            <span class="title-large text-on-surface">{{ trackTitle }}</span>
            <!-- <h3 class="title-large text-on-surface font-semibold truncate">{{ trackTitle }}</h3> -->
          </div>

          <button
            @click="handleClose"
            class="flex items-center justify-center aspect-square w-10 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <textarea
            ref="textareaRef"
            v-model="commentText"
            placeholder="Écrivez votre avis sur ce titre..."
            rows="1"
            class="w-full min-h-36 max-h-60 p-3 rounded-small border border-outline-variant bg-surface body-medium text-on-surface outline-none focus:border-primary resize-none overflow-y-auto"
            autoFocus
          ></textarea>

          <!-- Actions -->
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="handleClose"
              :disabled="isSaving"
              class="px-4 py-2 rounded-full border border-outline-variant label-medium text-on-surface-variant hover:border-error hover:text-error cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-5 py-2 rounded-full bg-primary label-medium text-on-primary hover:bg-primary/90 cursor-pointer transition-colors disabled:opacity-50"
            >
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>