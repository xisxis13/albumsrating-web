<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
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
  <main class="flex items-center justify-center h-dvh p-3 gap-3 bg-surface">
    <NavigationRail />

    <div
      class="flex flex-col w-full h-full p-6 gap-6 rounded-large bg-surface-container-lowest overflow-scroll"
    >
      <button
        class="flex items-center w-fit p-1 gap-2 rounded-full cursor-pointer hover:bg-surface-container"
        @click="goBack"
      >
        <ArrowLeft class="text-on-surface" />
      </button>

      <p v-if="profileStore.loading" class="body-medium text-on-surface-variant">
        Chargement…
      </p>

      <p v-else-if="profileStore.error" class="body-medium text-error">
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
            class="flex items-center justify-center aspect-square w-16 rounded-full bg-primary-container text-on-primary-container title-large"
          >
            {{ profileStore.profile.displayName?.charAt(0) ?? '?' }}
          </div>

          <div class="flex flex-col">
            <span class="title-medium text-on-surface">{{ profileStore.profile.displayName }}</span>
            <span class="body-medium text-on-surface-variant">
              {{ authStore.user?.email }}
            </span>
          </div>
        </div>

        <p class="body-small text-on-surface-variant">
          Membre depuis le {{ formatDate(profileStore.profile.createdAt) }}
        </p>
      </template>

      <button
        class="w-full px-6 py-3 rounded-full bg-error text-on-error label-large cursor-pointer"
        @click="authStore.signOut()"
      >
        Se déconnecter
      </button>
    </div>
  </main>
</template>