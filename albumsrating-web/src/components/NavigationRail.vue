<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import NavigationRailItem from './NavigationRailItem.vue'
import AppIcon from './AppIcon.vue'
import {
  Home,
  Search,
  TextAlignStart,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const isDark = ref(false)
const isMobileMenuOpen = ref(false)

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/search', label: 'Recherche', icon: Search },
  { path: '/collection', label: 'Collection', icon: TextAlignStart },
]

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  }
)

function updateFavicon() {
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!favicon) return

  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary')
    .trim()

  const svgString = `<svg width="212" height="203" viewBox="0 0 212 203" fill="${primaryColor}" xmlns="http://www.w3.org/2000/svg">
    <path d="M106.009 0C107.985 4.00707e-05 109.924 0.5191 111.634 1.50098L111.972 1.70312L112.303 1.91699C113.831 2.94239 115.085 4.32516 115.957 5.94434L116.137 6.29492L116.14 6.30078L139.237 53.1572L139.448 53.5684C140.533 55.6087 142.066 57.3774 143.934 58.7383C145.927 60.1897 148.241 61.134 150.678 61.4922H150.677L202.33 69.0635H202.329C204.284 69.3485 206.128 70.1409 207.678 71.3584L207.984 71.6084L208.282 71.8682C209.647 73.1042 210.689 74.6551 211.318 76.3848L211.447 76.7578L211.562 77.1357C212.105 79.0314 212.144 81.0388 211.672 82.958C211.168 85.0053 210.101 86.872 208.592 88.3457L208.59 88.3486L171.232 124.782C169.465 126.507 168.143 128.637 167.379 130.989C166.615 133.341 166.432 135.843 166.847 138.28L175.662 189.728L175.723 190.119C175.999 192.081 175.755 194.083 175.012 195.925C174.22 197.889 172.892 199.592 171.178 200.839C169.465 202.086 167.434 202.825 165.319 202.973C163.214 203.119 161.111 202.673 159.248 201.686L113.072 177.371V177.37C110.891 176.224 108.465 175.626 106.004 175.626C103.541 175.626 101.114 176.225 98.9324 177.372L98.9314 177.371L89.4998 182.339V137.836C94.2985 140.793 99.9496 142.5 106 142.5C123.397 142.5 137.5 128.397 137.5 111C137.5 93.6031 123.397 79.5001 106 79.5C88.6028 79.5 74.4998 93.603 74.4998 111V190.239L52.784 201.678C50.9143 202.669 48.8034 203.116 46.6922 202.966C44.5809 202.815 42.5547 202.075 40.8445 200.829C39.1342 199.583 37.8089 197.882 37.0173 195.921C36.2259 193.96 35.9992 191.816 36.364 189.733L45.1697 138.292V138.291C45.5876 135.851 45.4066 133.346 44.6423 130.992C43.8783 128.639 42.5545 126.508 40.7859 124.782L3.42946 88.3594L3.43044 88.3584C1.91747 86.8888 0.845396 85.0264 0.335709 82.9805C-0.175793 80.927 -0.101696 78.771 0.550552 76.7578L0.679459 76.3828C1.35514 74.5223 2.50839 72.8688 4.02711 71.5908L4.33473 71.3408C5.88673 70.1252 7.73205 69.3347 9.68825 69.0527L61.3338 61.4922L61.3377 61.4912C63.7761 61.1359 66.0927 60.1924 68.0877 58.7412C70.0827 57.2898 71.6967 55.3734 72.7898 53.1572L95.8767 6.30176L95.8806 6.29492C96.8138 4.40675 98.2561 2.81587 100.046 1.70312L100.384 1.50098C102.093 0.51905 104.032 3.33738e-05 106.009 0Z"/>
    <circle cx="106" cy="111" r="8"/>
  </svg>`

  favicon.href = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`
}

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
  }

  isDark.value = localStorage.getItem('theme') === 'dark'
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  updateFavicon()
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

  updateFavicon()
}
</script>

<template>
  <!-- Header - Mobile -->
  <header class="flex md:hidden items-center justify-between w-full px-2 py-1 shrink-0">
    <RouterLink to="/" class="flex items-center gap-3">
      <AppIcon class="w-8 h-8 text-primary" />
      <span class="title-large text-on-surface">AlbumsRating</span>
    </RouterLink>

    <button
      @click="isMobileMenuOpen = true"
      aria-label="Ouvrir le menu"
      class="flex items-center justify-center w-11 h-11 rounded-full text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
    >
      <Menu class="w-6 h-6" />
    </button>
  </header>

  <!-- Navigation Rail - Mobile -->
  <Teleport to="body">
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-50 flex md:hidden">
      <div
        class="fixed inset-0 bg-scrim transition-opacity"
        @click="isMobileMenuOpen = false"
      />

      <aside
        class="relative z-10 flex flex-col justify-between w-72 max-w-[80vw] h-full p-4 rounded-r-large bg-surface-container-low shadow-xl"
      >
        <div class="flex flex-col gap-6">
          <div class="flex items-center justify-between px-1 pt-0.5">
            <div class="flex items-center gap-3">
              <AppIcon class="w-8 h-8 text-primary" />
              <span class="title-large text-on-surface">AlbumsRating</span>
            </div>

            <button
              @click="isMobileMenuOpen = false"
              aria-label="Fermer le menu"
              class="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <nav class="flex flex-col gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-4 py-3 rounded-full label-large transition-colors"
              :class="
                route.path === item.path
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              "
            >
              <component :is="item.icon" class="w-5 h-5 shrink-0" />
              <span>{{ item.label }}</span>
            </RouterLink>
          </nav>
        </div>

        <!-- Actions du bas (Thème + Profil) -->
        <div class="flex flex-col gap-2 pt-4 border-t border-outline-variant/40">
          <button
            @click="toggleTheme"
            class="flex items-center gap-3 w-full px-4 py-3 rounded-full label-large text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            <Sun v-if="isDark" class="w-5 h-5 shrink-0" />
            <Moon v-else class="w-5 h-5 shrink-0" />
            <span>{{ isDark ? 'Mode clair' : 'Mode sombre' }}</span>
          </button>

          <RouterLink
            to="/profile"
            class="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-surface-container-highest transition-colors"
          >
            <img
              v-if="profileStore.profile?.avatarUrl"
              :src="profileStore.profile.avatarUrl"
              referrerpolicy="no-referrer"
              alt="User avatar"
              class="w-9 h-9 rounded-full shrink-0"
            />
            <div
              v-else
              class="flex items-center justify-center w-9 h-9 rounded-full bg-primary-container text-on-primary-container title-medium shrink-0"
            >
              {{ profileStore.profile?.displayName?.charAt(0) ?? '?' }}
            </div>

            <div class="flex flex-col min-w-0">
              <span class="label-large text-on-surface truncate">
                {{ profileStore.profile?.displayName ?? 'Mon profil' }}
              </span>
              <span class="body-small text-on-surface-variant">Voir le profil</span>
            </div>
          </RouterLink>
        </div>
      </aside>
    </div>
  </Teleport>

  <!-- Navigation Rail - Tablet & Desktop -->
  <div class="hidden md:flex flex-col items-center justify-between h-full py-10">
    <AppIcon class="w-11 h-11 text-primary" />

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

      <RouterLink to="/profile">
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