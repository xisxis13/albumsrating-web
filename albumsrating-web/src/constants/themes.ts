import type { UserSettings } from '@/types/userSettings'

export const THEMES = [
  { label: 'Système', value: 'system' },
  { label: 'Clair', value: 'light' },
  { label: 'Sombre', value: 'dark' },
] as const

// TODO: Add a color preview for UI
export const COLORSCHEMES = [
  { label: 'Par défaut', value: 'default' },
  { label: 'Bleu', value: 'blue' },
  { label: 'Vert', value: 'green' },
  { label: 'Jaune', value: 'yellow' },
  { label: 'Rose', value: 'pink' },
] as const

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'userId'> = {
  theme: 'system',
  colorScheme: 'default',
}