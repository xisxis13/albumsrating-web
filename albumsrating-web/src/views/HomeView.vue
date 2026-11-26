<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { useCollectionStore } from '@/stores/collectionStore'

import { DatabaseX, Disc3, Search } from '@lucide/vue'
import HomeItemCard from '@/components/HomeItemCard.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const collectionStore = useCollectionStore()

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
    collectionStore.fetchCollection()
  }
})

const firstName = computed(() => {
  const raw = profileStore.profile?.displayName?.trim()
  return raw ? raw.split(/\s+/)[0] : ''
})

const albumCount = computed(() => collectionStore.items?.length ?? 0)

const albumCountLabel = computed(() => {
  return `${albumCount.value > 1 ? albumCount.value : 'Aucun'} ${albumCount.value > 1 ? 'albums' : 'album'}`
})
</script>

<template>
  <template v-if="authStore.isAuthenticated">
    <main class="flex flex-col flex-1 min-w-0 min-h-0 w-full md:h-full p-4 sm:p-6 gap-6 overflow-y-auto md:rounded-large md:bg-surface-container-lowest">
      <header
        class="flex flex-col md:flex-row md:items-end md:justify-between p-4 sm:p-5 gap-4 rounded-large bg-surface-container sm:bg-surface-container-low"
      >
        <div class="flex flex-col gap-1 min-w-0">
          <span class="title-medium sm:title-large text-on-surface-variant">
            Ravie de vous revoir,
          </span>
          <h1 class="display-small sm:display-medium text-primary truncate tracking-tight">
            {{ firstName }}
          </h1>
        </div>

        <nav
          aria-label="Actions rapides de la bibliothèque"
          class="flex flex-col md:flex-row w-full md:w-auto gap-3 shrink-0"
        >
          <RouterLink
            to="/collection"
            class="flex flex-1 items-center justify-center px-4 py-3 gap-2.5 rounded-full bg-primary-container text-on-primary-container transition-[background-color,transform] duration-200 hover:brightness-95 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container"
          >
            <Disc3 class="w-5 h-5 shrink-0" aria-hidden="true" />
            <span
              v-if="!collectionStore.loaded"
              class="h-4 w-16 rounded-full bg-on-primary-container/15 animate-pulse"
              aria-hidden="true"
            />
            <span
              v-else
              class="label-large font-semibold tabular-nums whitespace-nowrap"
            >
              {{ albumCountLabel }}
            </span>
          </RouterLink>

          <RouterLink
            to="/search"
            class="flex flex-1 sm:flex-initial items-center justify-center px-5 py-3 gap-2.5 rounded-full bg-primary text-on-primary transition-[background-color,transform] duration-200 hover:brightness-105 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container"
          >
            <Search class="w-5 h-5 shrink-0" aria-hidden="true" />
            <span class="label-large font-semibold whitespace-nowrap">
              Explorer
            </span>
          </RouterLink>
        </nav>
      </header>

      <section class="flex flex-col gap-3 min-w-0 py-3">
        <div class="flex items-center justify-between w-full">
          <span class="title-large text-on-surface">Continuer l'évaluation</span>

          <RouterLink
            to="/collection"
            class="px-3 py-2 rounded-full label-large text-primary cursor-pointer hover:underline"
          >
            Voir plus
          </RouterLink>
        </div>

        <p
          v-if="collectionStore.loaded && collectionStore.recentlyUpdated.length === 0"
          class="body-medium text-on-surface-variant"
        >
          Votre collection est vide.
        </p>

        <div
          v-else
          class="flex w-full gap-4 overflow-x-scroll"
        >
          <HomeItemCard
            v-for="item in collectionStore.recentlyUpdated"
            :key="item.reviewId"
            :to="`/album/${item.album.spotifyId}`"
            :album="item.album"
            :average-rating="item.album.review.averageRating ?? undefined"
            :rated-tracks="item.album.tracks.filter(t => t.review?.rating != null).length"
            :total-tracks="item.album.tracks.length"
          />
        </div>
      </section>

      <section class="flex flex-col gap-3 min-w-0">
        <div class="flex items-center justify-between w-full">
          <span class="title-large text-on-surface">Ajoutés récemment</span>

          <RouterLink
            to="/collection"
            class="px-3 py-2 rounded-full label-large text-primary cursor-pointer hover:underline"
          >
            Voir plus
          </RouterLink>
        </div>

        <p
          v-if="collectionStore.loaded && collectionStore.recentlyAdded.length === 0"
          class="body-medium text-on-surface-variant"
        >
          Votre collection est vide.
        </p>

        <div
          v-else
          class="flex w-full gap-4 overflow-x-scroll"
        >
          <HomeItemCard
            v-for="item in collectionStore.recentlyAdded"
            :key="item.reviewId"
            :to="`/album/${item.album.spotifyId}`"
            :album="item.album"
            :average-rating="item.album.review.averageRating ?? undefined"
            :rated-tracks="item.album.tracks.filter(t => t.review?.rating != null).length"
            :total-tracks="item.album.tracks.length"
          />
        </div>
      </section>
    </main>
  </template>

  <template v-else>
    <div class="flex flex-col items-center justify-center flex-1 min-h-0 w-full h-full py-6 gap-3 sm:rounded-large sm:bg-surface-container-lowest">
      <DatabaseX class="w-12 h-12 text-primary" />
      <span class="title-medium text-on-surface">Vous n'êtes pas connecté</span>
      <span class="body-medium text-on-surface-variant">Vérifiez votre connexion ou ré-authentifiez vous</span>
      <RouterLink
        to="/login"
        class="px-6 py-3 rounded-full border border-outline-variant label-large text-on-surface-variant cursor-pointer hover:border-primary hover:text-primary"
      >
        Authentifiez vous
      </RouterLink>
    </div>
  </template>
</template>