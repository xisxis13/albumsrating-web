<script setup lang="ts">
import { RouterView } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

console.log('Utilisateur connecté : ', authStore.user)

console.log('Supabase client prêt :', !!supabase)
</script>

<template>
  <h1 class="p-8 text-3xl font-bold text-orange-500">
    AlbumsRating
  </h1>

  <RouterView />
</template>
