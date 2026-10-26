<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-dvh p-3 gap-6 bg-surface-light">
    <div class="flex items-center justify-center gap-4">
      <img class="aspect-square w-16" src="../assets/app_icon_light.svg" alt="AlbumsRating icon" />

      <h1 class="headline-medium">AlbumsRating</h1>
    </div>

    <div
      class="flex flex-col items-start justify-center max-w-96 p-6 gap-6 rounded-large bg-surface-container-lowest-light"
    >
      <div class="flex flex-col items-start justify-center gap-1">
        <span class="title-large">Ravi de vous revoir,</span>
        <span class="body-medium text-on-surface-variant-light">
          Connectez-vous pour récupérer vos données ou inscrivez-vous
        </span>
      </div>

      <button
        class="flex items-center justify-center w-full px-6 py-3 gap-3 border border-outline-variant-light rounded-full text-on-surface-variant-light cursor-pointer hover:border-on-surface-light hover:bg-surface-light hover:text-on-surface-light"
        @click="authStore.signInWithGoogle()"
      >
        <img class="aspect-square w-6" src="../assets/google.svg" alt="Google icon" />
        <span class="label-large">Se connecter avec Google</span>
      </button>
    </div>
  </div>
</template>
