import { supabase } from '@/lib/supabase'
import { toAppError } from '@/utils/errors'
import type { ColorScheme, Theme, UserSettings } from '@/types/userSettings'

interface SettingsResponse {
  user_id: string
  theme: Theme
  color_scheme: ColorScheme
}

function toUserSettings(response: SettingsResponse): UserSettings {
  return {
    userId: response.user_id,
    theme: response.theme,
    colorScheme: response.color_scheme,
  }
}

export const settingsService = {
  async getSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id, theme, color_scheme')
      .eq('user_id', userId)
      .maybeSingle<SettingsResponse>()

    if (error) throw toAppError(error, 'Impossible de charger les préférences.')

    return data ? toUserSettings(data) : null
  },

  async updateTheme(userId: string, newTheme: Theme): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .update({ theme: newTheme })
      .eq('user_id', userId)

    if (error) throw toAppError(error, 'Impossible de modifier le thème.')
  },

  async updateColorScheme(userId: string, newColorScheme: ColorScheme): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .update({ color_scheme: newColorScheme })
      .eq('user_id', userId)

    if (error) throw toAppError(error, 'Impossible de modifier la palette de couleur.')
  },
}