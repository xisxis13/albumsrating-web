import { defineStore } from "pinia"
import { ref } from "vue"
import { profileService } from "@/services/profileService"
import { useNotificationStore } from './notificationStore'
import { getErrorMessage } from '@/utils/errors'
import type { Profile } from "@/types/profile"

export const useProfileStore = defineStore('profile', () => {
  const notificationStore = useNotificationStore()

  const profile = ref<Profile | null>(null)
  const loading = ref(false)

  async function fetchProfile(userId: string) {
    if (profile.value?.id === userId) return

    loading.value = true
    profile.value = null

    try {
      profile.value = await profileService.getProfile(userId)
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  function clear() {
    profile.value = null
  }

  return { 
    profile, 
    loading, 
    fetchProfile, 
    clear,
  }
})
