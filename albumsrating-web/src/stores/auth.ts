import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  async function initialize() {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    user.value = session?.user ?? null
    loading.value = false

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google'
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
