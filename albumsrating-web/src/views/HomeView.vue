<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore()
</script>

<template>
  <main class="flex items-center justify-center h-dvh p-3 bg-surface-light">
    <div class="p-6 rounded-large bg-surface-container-lowest-light">
      <h1 class="title-large">
        AlbumsRating
      </h1>

      <div class="mt-6">
        <p>
          Connecté en tant que :
        </p>

        <p class="font-semibold">
          {{ authStore.user?.email }}
        </p>
      </div>

      <button
        class="mt-6 px-4 py-2 rounded-extra-large bg-error-light  text-on-error-light"
        @click="authStore.signOut()"
      >
        Déconnexion
      </button>
    </div>
  </main>
</template>
