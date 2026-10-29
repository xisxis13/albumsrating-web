import './assets/base.css'
import './assets/main.css'

import '@material/web/menu/menu.js'
import '@material/web/menu/menu-item.js'
import '@material/web/menu/sub-menu.js'
import '@material/web/divider/divider.js'

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

app.mount('#app')
