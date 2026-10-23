<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore()
</script>

<template>
  <main class="p-8">
    <h1 class="text-3xl font-bold">
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
      class="mt-6 rounded bg-red-500 px-4 py-2 text-white"
      @click="authStore.signOut()"
    >
      Déconnexion
    </button>
  </main>
</template>
