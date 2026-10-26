import { defineStore } from "pinia"
import { ref } from "vue"
import { supabase } from "@/lib/supabase"


export interface Profile {
  id: string
  displayName: string | null
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string | null
}

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile(userId: string) {
    if (profile.value?.id === userId) return

    loading.value = true
    error.value = null
    profile.value = null

    const { data, error: fetchError } = await supabase
      .from('profile')
      .select('id, display_name, avatar_url, created_at, last_login_at')
      .eq('id', userId)
      .single()

    if (fetchError) {
      error.value = 'Impossible de charger le profil.'
    } else {
      profile.value = {
        id: data.id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        lastLoginAt: data.last_login_at,
      }
    }

    loading.value = false
  }

  return { profile, loading, error, fetchProfile }
})
