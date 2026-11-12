<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useCollectionStore, type CollectionItem } from '@/stores/collection'

import { DatabaseX } from '@lucide/vue'
import NavigationRail from '@/components/NavigationRail.vue'
import HomeItemCard from '@/components/HomeItemCard.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const collectionStore = useCollectionStore()

const isAuthenticated = computed(() => Boolean(authStore.user))

onMounted(() => {
  if (authStore.user) {
    profileStore.fetchProfile(authStore.user.id)
    collectionStore.fetchCollection()
  }
})
</script>

<template>
  <template v-if="isAuthenticated">
    <div class="flex flex-col flex-1 min-w-0 min-h-0 w-full md:h-full p-4 sm:p-6 gap-6 overflow-y-auto rounded-large bg-surface-container-lowest">
      <div class="flex flex-col gap-1 px-1 py-4">
        <span class="title-large text-on-surface-variant">Ravie de vous revoir</span>
        <span class="display-small text-primary">
          {{ profileStore.profile?.displayName?.split(' ')[0] ?? '' }}
        </span>
      </div>

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
    </div>
  </template>

  <template v-else>
    <div class="flex flex-col items-center justify-center flex-1 min-h-0 w-full md:h-full gap-3 rounded-large bg-surface-container-lowest">
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