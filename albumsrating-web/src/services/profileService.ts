import { supabase } from "@/lib/supabase"
import { toAppError } from "@/utils/errors"
import type { Profile } from "@/types/profile"

interface ProfileResponse {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  last_login_at: string | null
}

function toProfile(response: ProfileResponse): Profile {
  return {
    id: response.id,
    displayName: response.display_name,
    avatarUrl: response.avatar_url,
    createdAt: response.created_at,
    lastLoginAt: response.last_login_at,
  }
}

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profile')
      .select('id, display_name, avatar_url, created_at, last_login_at')
      .eq('id', userId)
      .single<ProfileResponse>()

    if (error) throw toAppError(error, 'Impossible de charger le profil.')

    return toProfile(data)
  }
}