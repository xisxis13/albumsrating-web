import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useCollectionStore } from './collection'
import type { User } from '@supabase/supabase-js'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  async function initialize() {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    user.value = session?.user ?? null
    loading.value = false

    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null

      if (event === 'SIGNED_IN' && router.currentRoute.value.path === '/login') {
        router.push('/')
      }

      if (event === 'SIGNED_OUT') {
        useCollectionStore().reset()
        router.push('/login')
      }
    })
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    initialize,
    signInWithGoogle,
    signOut,
  }
})
