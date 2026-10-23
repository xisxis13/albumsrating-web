import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import { useAuthStore } from '@/stores/auth.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  console.log('GUARD')
  console.log('Route :', to.path)
  console.log('User :', authStore.user)
  console.log('RequiresAuth :', to.meta.requiresAuth)

  if (to.meta.requiresAuth && !authStore.user) {
    console.log('REDIRECTION LOGIN')
    return '/login'
  }

  if (to.path === '/login' && authStore.user) {
    console.log('REDIRECTION HOME')
    return '/'
  }

  return true
})

export default router
