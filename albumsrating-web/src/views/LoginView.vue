<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/AppIcon.vue';

const authStore = useAuthStore()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-dvh p-6 gap-6 bg-surface">
    <div class="flex items-center justify-center gap-4">
      <AppIcon class="w-11 h-11 text-primary" />

      <h1 class="headline-medium text-on-surface">AlbumsRating</h1>
    </div>

    <div
      class="flex flex-col items-start justify-center max-w-full sm:max-w-96 p-6 gap-6 rounded-large bg-surface-container-lowest"
    >
      <div class="flex flex-col items-start justify-center gap-1">
        <span class="title-large text-on-surface">Ravi de vous revoir,</span>
        <span class="body-medium text-on-surface-variant">
          Connectez-vous avec Google pour retrouver vos notes ou démarrer votre collection.
        </span>
        <span class="body-small text-outline">
          Note : de nouvelles façons de se connecter arriveront bientôt.
        </span>
      </div>

      <button
        class="flex items-center justify-center w-full px-6 py-3 gap-3 border border-outline-variant rounded-full text-on-surface-variant cursor-pointer hover:border-on-surface hover:bg-surface hover:text-on-surface"
        @click="authStore.signInWithGoogle()"
      >
        <img class="aspect-square w-6" src="../assets/google.svg" alt="Google icon" />
        <span class="label-large">Se connecter avec Google</span>
      </button>
    </div>
  </div>
</template>
