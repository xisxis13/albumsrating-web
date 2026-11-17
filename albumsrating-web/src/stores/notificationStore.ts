import { defineStore } from "pinia"
import { ref } from "vue"
import type { Notification, NotificationType } from "@/types/notification"

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function dismiss(id: string) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function add(type: NotificationType, message: string, duration = 4500) {
    const id = crypto.randomUUID()
    notifications.value.push({ id, type, message, duration })

    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration)
      timers.set(id, timer)
    }

    return id
  }

  function error(message: string, duration = 5000) {
    return add('error', message, duration)
  }

  function success(message: string, duration = 3500) {
    return add('success', message, duration)
  }

  function info(message: string, duration = 4000) {
    return add('info', message, duration)
  }

  function clear() {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    notifications.value = []
  }

  return {
    notifications,
    dismiss,
    add,
    error,
    success,
    info,
    clear,
  }
})