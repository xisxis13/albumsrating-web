<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import NavigationRailItem from './NavigationRailItem.vue'
import {
  Home,
  Search,
  TextAlignStart,
  Sun,
  Moon,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const isDark = ref(false)

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/search', label: 'Recherche', icon: Search },
  { path: '/collection', label: 'Collection', icon: TextAlignStart },
]

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
  }

  isDark.value = localStorage.getItem('theme') === 'dark'
})

function toggleTheme() {
  isDark.value = !isDark.value
  
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

</script>

<template>
  <div class="flex flex-col items-center justify-between h-full py-10">
    <img 
      src="../assets/app_icon_light.svg" 
      alt="AlbumsRating icon"
      class="w-11 aspect-square dark:hidden"
    />
    <img 
      src="../assets/app_icon_dark.svg" 
      alt="AlbumsRating icon"
      class="w-11 aspect-square hidden dark:block"
    />

    <nav>
      <NavigationRailItem 
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :label="item.label"
        :icon="item.icon"
      />
    </nav>

    <div class="flex flex-col items-center gap-6">
      <button
        @click="toggleTheme"
        class="flex items-center justify-center aspect-square w-11 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
        :title="isDark ? 'Passer au mode clair' : 'Passer au mode sombre'"
      >
        <Sun v-if="isDark" class="w-6 h-6" />
        <Moon v-else class="w-6 h-6" />
      </button>

      <RouterLink
        to="/profile"
      >
        <img 
          v-if="profileStore.profile?.avatarUrl"
          :src="profileStore.profile.avatarUrl" 
          referrerpolicy="no-referrer"
          alt="User avatar"
          class="w-11 aspect-square rounded-full"
        />
        <div
          v-else
          class="flex items-center justify-center aspect-square w-11 rounded-full bg-primary-container text-on-primary-container text-title-large"
        >
          {{ profileStore.profile?.displayName?.charAt(0) ?? '?' }}
        </div>
      </RouterLink>
    </div>
  </div>
</template>