import './assets/base.css'
import './assets/main.css'

import { useNotificationStore } from './stores/notificationStore'
import { getErrorMessage } from './utils/errors'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from './stores/auth.ts'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore(pinia)
await authStore.initialize()

app.use(router)

app.config.errorHandler = (err, _instance, info) => {
  console.error(`[Vue Error - ${info}]`, err)
  const notificationStore = useNotificationStore(pinia)
  notificationStore.error(getErrorMessage(err))
}

app.mount('#app')
