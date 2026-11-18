<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { useSettingsStore } from '@/stores/settingsStore'

import NavigationRail from '@/components/NavigationRail.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()

const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

function applyAppearance() {
  const isDark =
    settingsStore.theme.value === 'dark' ||
    ((settingsStore.theme.value as string) === 'system' && darkMediaQuery.matches)

  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.dataset.colorScheme = settingsStore.colorScheme.value
}

watch(
  () => authStore.user,
  (newUser, oldUser) => {
    if (newUser) {
      profileStore.fetchProfile(newUser.id)
      settingsStore.fetchSettings(newUser.id)
    } else if (oldUser) {
      profileStore.clear()
      settingsStore.clear()

      if (route.path !== '/login') {
        router.push('/login')
      }
    }
  },
  { immediate: true },
)

watch(
  [() => settingsStore.theme.value, () => settingsStore.colorScheme.value],
  applyAppearance,
  { immediate: true },
)

onMounted(() => {
  darkMediaQuery.addEventListener('change', applyAppearance)
})

onUnmounted(() => {
  darkMediaQuery.removeEventListener('change', applyAppearance)
})
</script>

<template>
  <template v-if="route.path !== '/login'">
    <main class="flex flex-col md:flex-row items-stretch md:items-center justify-center sm:h-dvh md:p-3 gap-3">
      <NavigationRail />

      <RouterView />
    </main>
  </template>

  <template v-else>
    <RouterView />
  </template>

  <ToastContainer />
</template>