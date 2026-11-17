import { THEMES, COLORSCHEMES } from '@/constants/themes'

export type Theme = (typeof THEMES)[number]['value']
export type ColorScheme = (typeof COLORSCHEMES)[number]['value']

export interface UserSettings {
  theme: Theme
  colorScheme: ColorScheme
}