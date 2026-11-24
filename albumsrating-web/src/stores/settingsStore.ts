import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { settingsService } from '@/services/settingsService'
import { useAuthStore } from './authStore'
import { useNotificationStore } from './notificationStore'
import { getErrorMessage } from '@/utils/errors'
import { THEMES, COLORSCHEMES } from '@/constants/themes'
import type { ColorScheme, ColorSchemeOption, Theme, ThemeOption, UserSettings } from '@/types/userSettings'

const DEFAULT_THEME: ThemeOption = THEMES[0]!
const DEFAULT_COLOR_SCHEME: ColorSchemeOption = COLORSCHEMES[0]!

export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  const settings = ref<UserSettings | null>(null)
  const loading = ref(false)
  const themeOverride = ref<Theme | null>(null)

  const theme = computed<ThemeOption>(
    () => THEMES.find((t) => t.value === settings.value?.theme) ?? DEFAULT_THEME,
  )
  const effectiveTheme = computed<Theme>(
    () => themeOverride.value ?? settings.value?.theme ?? DEFAULT_THEME.value,
  )
  const colorScheme = computed<ColorSchemeOption>(
    () => COLORSCHEMES.find((c) => c.value === settings.value?.colorScheme) ?? DEFAULT_COLOR_SCHEME,
  )

  function setThemeOverride(newTheme: Theme) {
    themeOverride.value = newTheme
  }

  async function fetchSettings(userId: string) {
    if (settings.value?.userId === userId) return

    loading.value = true

    try {
      const data = await settingsService.getSettings(userId)

      settings.value = data ?? {
        userId,
        theme: DEFAULT_THEME.value,
        colorScheme: DEFAULT_COLOR_SCHEME.value,
      }
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  async function updateTheme(newTheme: Theme) {
    const userId = settings.value?.userId ?? authStore.user?.id
    if (!userId) return

    loading.value = true

    try {
      await settingsService.updateTheme(userId, newTheme)

      if (settings.value) {
        settings.value.theme = newTheme
      }
      themeOverride.value = null
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  async function updateColorScheme(newColorScheme: ColorScheme) {
    const userId = settings.value?.userId ?? authStore.user?.id
    if (!userId) return

    loading.value = true

    try {
      await settingsService.updateColorScheme(userId, newColorScheme)

      if (settings.value) {
        settings.value.colorScheme = newColorScheme
      }
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  function clear() {
    settings.value = null
    themeOverride.value = null
  }

  return {
    settings,
    loading,
    theme,
    effectiveTheme,
    colorScheme,
    fetchSettings,
    updateTheme,
    updateColorScheme,
    setThemeOverride,
    clear,
  }
})