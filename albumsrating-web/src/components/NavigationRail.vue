<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import NavigationRailItem from './NavigationRailItem.vue'
import {
  Home,
  Search,
  TextAlignStart,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const profileStore = useProfileStore()

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/search', label: 'Recherche', icon: Search },
  { path: '/collection', label: 'Collection', icon: TextAlignStart },
]

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-between h-full py-10">
    <img 
      src="../assets/app_icon_light.svg" 
      alt="AlbumsRating icon"
      class="w-11 aspect-square"
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
        class="flex items-center justify-center aspect-square w-16 rounded-full bg-primary-container-light text-on-primary-container-light text-title-large"
      >
        {{ profileStore.profile?.displayName?.charAt(0) ?? '?' }}
      </div>
    </RouterLink>
  </div>
</template>