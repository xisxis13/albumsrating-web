<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import NavigationRail from '@/components/NavigationRail.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
  }
})
</script>

<template>
  <main class="flex items-center justify-center h-dvh p-3 gap-3 bg-surface-light">
    <NavigationRail />

    <div class="flex flex-col items-center justify-center w-full h-full p-6 gap-6 rounded-large bg-surface-container-lowest-light">
      <h1 class="title-large">AlbumsRating</h1>

      <p class="body-large">
        Bienvenue{{ profileStore.profile?.displayName ? `, ${profileStore.profile.displayName}` : '' }} !
      </p>
    </div>
  </main>
</template>