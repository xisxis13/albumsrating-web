<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { ArrowLeft } from 'lucide-vue-next'
import { COLORSCHEMES, THEMES } from '@/constants/themes'
import { Blend, SwatchBook, Info, ChevronRight, ChevronDown, SquareSplitHorizontal } from '@lucide/vue'
import type { ColorScheme, Theme } from '@/types/userSettings'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
  }
})

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/')
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-BE', { dateStyle: 'long' })
}

function handleThemeChange(event: Event) {
  const newTheme = (event.target as HTMLSelectElement).value as Theme
  settingsStore.updateTheme(newTheme)
}

function handleColorSchemeChange(event: Event) {
  const newColorScheme = (event.target as HTMLSelectElement).value as ColorScheme
  settingsStore.updateColorScheme(newColorScheme)
}
</script>

<template>
  <div class="flex flex-col min-w-0 min-h-0 w-full h-full p-4 sm:p-6 gap-6 overflow-scroll md:rounded-large md:bg-surface-container-lowest">
    <button
      @click="goBack"
      class="flex items-center justify-center aspect-square w-10 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
    >
      <ArrowLeft class="w-6 h-6" />
    </button>

    <p v-if="profileStore.loading" class="body-medium text-on-surface-variant">
      Chargement…
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
          <span class="body-small text-on-surface-variant">
            Membre depuis le {{ formatDate(profileStore.profile.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Settings -->
      <div class="flex flex-col gap-0.5 rounded-large overflow-hidden shrink-0">
        <div class="flex items-center px-4 py-3 pr-3 gap-4 rounded-extra-small bg-surface-container sm:bg-surface-container-low">
          <Blend class="text-on-surface w-5 h-5" />
          <span class="flex-1 title-medium text-on-surface">Apparence</span>

          <div class="relative">
            <ChevronDown class="absolute right-3 top-1.5 text-on-surface-variant w-5 h-5 pointer-events-none" />
            <select
              v-model="settingsStore.theme.value"
              @change="handleThemeChange"            
              class="w-32 px-4 pr-10 py-1 rounded-medium body-medium text-right text-on-surface appearance-none cursor-pointer"
            >
              <option v-for="theme in THEMES" :key="theme.value" :value="theme.value">
                {{ theme.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center px-4 py-3 pr-3 gap-4 rounded-extra-small bg-surface-container sm:bg-surface-container-low">
          <SwatchBook class="text-on-surface w-5 h-5" />
          <div class="flex flex-col flex-1">
            <span class="title-medium text-on-surface">Palette de couleur</span>
            <span class="body-medium text-outline">Cette fonctionnalité sera disponible dans une prochaine version.</span>
          </div>

          <div class="relative">
            <!-- <ChevronDown class="absolute right-3 top-1.5 text-on-surface-variant w-5 h-5 pointer-events-none" /> -->
            <select
              disabled
              v-model="settingsStore.colorScheme.value"
              @change="handleColorSchemeChange"            
              class="w-32 px-4 pr-10 py-1 rounded-medium body-medium text-right text-on-surface appearance-none cursor-not-allowed"
            >
              <option v-for="scheme in COLORSCHEMES" :key="scheme.value" :value="scheme.value">
                {{ scheme.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- <div class="flex items-center px-4 py-3 gap-4 rounded-extra-small bg-surface-container sm:bg-surface-container-low">
          <SquareSplitHorizontal class="text-on-surface w-5 h-5" />
          <div class="flex flex-col flex-1">
            <span class="title-medium text-on-surface">Position de la navigation</span>
            <span class="body-medium text-outline">Disponible uniquement en paysage.</span>
          </div>

          <div class="relative">
            <ChevronDown class="absolute right-3 top-1.5 text-on-surface-variant w-5 h-5 pointer-events-none" />
            <select
              disabled

         
              class="w-32 px-4 pr-10 py-1 rounded-medium body-medium text-right text-on-surface appearance-none cursor-not-allowed"
            >
              <option value="left">Gauche</option>
              <option value="right">Droite</option>
            </select>
          </div>
        </div> -->

        <!-- <div class="flex items-center px-4 py-3 gap-4 rounded-extra-small bg-surface-container sm:bg-surface-container-low">
          <Info class="text-on-surface w-5 h-5" />
          <div class="flex flex-col flex-1">
            <span class="title-medium text-on-surface">À propos</span>
            <span class="body-medium text-outline">Version, développeur, feedback</span>
          </div>
          <ChevronRight class="text-on-surface-variant w-5 h-5" />
        </div> -->
      </div>
    </template>

    <button
      class="w-full px-6 py-3 rounded-full bg-error text-on-error label-large cursor-pointer"
      @click="authStore.signOut()"
      :disabled="authStore.loading"
    >
      Se déconnecter
    </button>
  </div>
</template>