import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { useNotificationStore } from './notificationStore'
import { getErrorMessage } from '@/utils/errors'
import type { AuthUser } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const notificationStore = useNotificationStore()

  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const isAuthenticated = computed(() => Boolean(user.value))

  let unsubscribe: (() => void) | null = null

  async function initialize() {
    try {
      user.value = await authService.getSession()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    }

    if (!unsubscribe) {
      unsubscribe = authService.onAuthStateChange((newUser) => {
        user.value = newUser
      })
    }
  }

  async function signInWithGoogle() {
    loading.value = true

    try {
      await authService.signInWithGoogle()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true

    try {
      await authService.signOut()
    } catch (error) {
      notificationStore.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    initialize,
    signInWithGoogle,
    signOut,
  }
})