<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const authStore = useAuthStore()
const profileStore = useProfileStore()

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
  }
})
</script>

<template>
  <main class="flex items-center justify-center h-dvh p-3 bg-surface-light">
    <div class="flex flex-col p-6 gap-6 rounded-large bg-surface-container-lowest-light">
      <h1 class="title-large">AlbumsRating</h1>

      <p class="body-large">
        Bienvenue{{ profileStore.profile?.displayName ? `, ${profileStore.profile.displayName}` : '' }} !
      </p>

      <RouterLink
        to="/search"
        class="px-6 py-3 rounded-full border border-outline-variant-light text-center label-large text-on-surface-variant-light hover:border-on-surface-light hover:text-on-surface-light"
      >
        Rechercher un album
      </RouterLink>

      <RouterLink
        to="/collection"
        class="px-6 py-3 rounded-full border border-outline-variant-light text-center label-large text-on-surface-variant-light hover:border-on-surface-light hover:text-on-surface-light"
      >
        Ma collection
      </RouterLink>

      <RouterLink
        to="/profile"
        class="px-6 py-3 rounded-full border border-outline-variant-light text-center label-large text-on-surface-variant-light hover:border-on-surface-light hover:text-on-surface-light"
      >
        Mon profil
      </RouterLink>
    </div>
  </main>
</template>