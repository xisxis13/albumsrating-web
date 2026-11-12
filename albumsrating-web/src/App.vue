<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'

import NavigationRail from './components/NavigationRail.vue'

const route = useRoute()

const isDark = ref(false)

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
  <main class="flex flex-col md:flex-row items-stretch md:items-center justify-center h-dvh p-3 gap-3">
    <NavigationRail />

    <RouterView />
  </main>
</template>