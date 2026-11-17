<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore.ts'

import NavigationRail from './components/NavigationRail.vue'
import ToastContainer from './components/ToastContainer.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isDark = ref(false)

watch(
  () => authStore.user,
  (newUser, oldUser) => {
    if (!newUser && oldUser && route.path !== '/login') {
      router.push('/login')
    }
  }
)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
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