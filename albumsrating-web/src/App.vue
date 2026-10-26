<script setup lang="ts">
import { RouterView } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

console.log('Utilisateur connecté : ', authStore.user)

console.log('Supabase client prêt :', !!supabase)
</script>

<template>
  <RouterView />
</template>
