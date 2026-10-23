<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="rounded-lg border p-8 shadow-md">
      <h1 class="mb-6 text-center text-2xl font-bold">
        AlbumsRating
      </h1>

      <p>User :</p>
      <pre>{{ authStore.user }}</pre>

      <button
        class="rounded bg-orange-500 px-6 py-3 text-white hover:bg-orange-600"
        @click="authStore.signInWithGoogle()"
      >
        Se connecter avec Google
      </button>
    </div>
  </div>
</template>
