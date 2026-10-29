<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { ArrowLeft } from 'lucide-vue-next'
import NavigationRail from '@/components/NavigationRail.vue';

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
  }
})

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/')
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-BE', { dateStyle: 'long' })
}
</script>

<template>
  <main class="flex items-center justify-center h-dvh p-3 gap-3">
    <NavigationRail />

    <div class="flex flex-col w-full h-full p-6 gap-6 overflow-scroll rounded-large bg-surface-container-lowest-light">
      <button
        @click="goBack"
        class="flex items-center justify-center aspect-square w-9 rounded-full text-on-surface-variant-light hover:bg-surface-container-highest-light transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-6 h-6" />
      </button>

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