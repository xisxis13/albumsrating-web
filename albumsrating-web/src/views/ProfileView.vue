<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';

const authStore = useAuthStore()
const profileStore = useProfileStore()

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
  }
})

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-BE', { dateStyle: 'long' })
}
</script>

<template>
  <main class="flex flex-col items-center justify-center h-dvh p-3 gap-6 bg-surface-light">
    <div
      class="flex flex-col w-full max-w-96 p-6 gap-6 rounded-large bg-surface-container-lowest-light"
    >
      <RouterLink to="/" class="label-large text-on-surface-variant-light hover:text-on-surface-light">
        ← Retour
      </RouterLink>

      <h1 class="headline-small">Profil</h1>

      <p v-if="profileStore.loading" class="body-medium text-on-surface-variant-light">
        Chargement…
      </p>

      <p v-else-if="profileStore.error" class="body-medium text-error-light">
        {{ profileStore.error }}
      </p>

      <template v-else-if="profileStore.profile">
        <div class="flex items-center gap-4">
          <img
            v-if="profileStore.profile.avatarUrl"
            :src="profileStore.profile.avatarUrl"
            referrerpolicy="no-referrer"
            alt="Avatar"
            class="aspect-square w-16 rounded-full"
          />
          <div
            v-else
            class="flex items-center justify-center aspect-square w-16 rounded-full bg-primary-container-light text-on-primary-container-light title-large"
          >
            {{ profileStore.profile.displayName?.charAt(0) ?? '?' }}
          </div>

          <div class="flex flex-col">
            <span class="title-medium">{{ profileStore.profile.displayName }}</span>
            <span class="body-medium text-on-surface-variant-light">
              {{ authStore.user?.email }}
            </span>
          </div>
        </div>

        <p class="body-small text-on-surface-variant-light">
          Membre depuis le {{ formatDate(profileStore.profile.createdAt) }}
        </p>
      </template>

      <button
        class="w-full px-6 py-3 rounded-full bg-error-light text-on-error-light label-large cursor-pointer"
        @click="authStore.signOut()"
      >
        Se déconnecter
      </button>
    </div>
  </main>
</template>