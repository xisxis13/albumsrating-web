<script setup lang="ts">
import { useNotificationStore } from '@/stores/notificationStore'
import type { NotificationType } from '@/types/notification'

const notificationStore = useNotificationStore()

const variantClasses: Record<NotificationType, string> = {
  error: 'bg-error-container text-on-error-container border-error/30',
  success: 'bg-primary-container text-on-primary-container border-primary/30',
  info: 'bg-surface-container-high text-on-surface border-outline-variant',
}
</script>

<template>
  <div
    aria-live="polite"
    class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
  >
    <TransitionGroup name="toast">
      <div
        v-for="item in notificationStore.notifications"
        :key="item.id"
        role="alert"
        :class="[
          'pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-small border shadow-md body-medium',
          variantClasses[item.type],
        ]"
      >
        <p class="flex-1">{{ item.message }}</p>

        <button
          type="button"
          aria-label="Fermer la notification"
          class="shrink-0 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
          @click="notificationStore.dismiss(item.id)"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.22s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>