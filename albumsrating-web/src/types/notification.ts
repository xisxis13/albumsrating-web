export type NotificationType = 'error' | 'success' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}