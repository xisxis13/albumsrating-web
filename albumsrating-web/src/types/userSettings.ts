import { THEMES, COLORSCHEMES } from '@/constants/themes'

export type ThemeOption = (typeof THEMES)[number]
export type ColorSchemeOption = (typeof COLORSCHEMES)[number]

export type Theme = ThemeOption['value']
export type ColorScheme = ColorSchemeOption['value']

export interface UserSettings {
  userId: string
  theme: Theme
  colorScheme: ColorScheme
}