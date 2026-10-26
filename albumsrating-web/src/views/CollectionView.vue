<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCollectionStore, type CollectionItem } from '@/stores/collection'

const collectionStore = useCollectionStore()

onMounted(() => {
  collectionStore.fetchCollection()
})

function remove(item: CollectionItem) {
  const confirmed = window.confirm(
    `Retirer « ${item.album.title} » de votre collection ?\nVos notes et commentaires sur cet album seront supprimés.`,
  )
  if (confirmed) collectionStore.removeAlbum(item.reviewId)
}
</script>

<template>
  <main class="flex flex-col items-center min-h-dvh p-3 bg-surface-light">
    <div class="flex flex-col w-full max-w-2xl p-6 gap-6 rounded-large bg-surface-container-lowest-light">
      <RouterLink to="/" class="label-large text-on-surface-variant-light hover:text-on-surface-light">
        ← Retour
      </RouterLink>

      <div class="flex items-end justify-between gap-4">
        <h1 class="headline-small">Ma collection</h1>
        <span v-if="collectionStore.loaded" class="body-medium text-on-surface-variant-light">
          {{ collectionStore.count }} album{{ collectionStore.count > 1 ? 's' : '' }}
        </span>
      </div>

      <p v-if="collectionStore.loading && !collectionStore.loaded" class="body-medium text-on-surface-variant-light">
        Chargement…
      </p>

      <p v-if="collectionStore.error" class="body-medium text-error-light">
        {{ collectionStore.error }}
      </p>

      <div
        v-else-if="collectionStore.loaded && collectionStore.count === 0"
        class="flex flex-col items-start gap-4"
      >
        <p class="body-medium text-on-surface-variant-light">
          Votre collection est vide pour l'instant.
        </p>
        <RouterLink
          to="/search"
          class="px-6 py-3 rounded-full bg-primary-light text-on-primary-light label-large"
        >
          Rechercher un album
        </RouterLink>
      </div>

      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="item in collectionStore.items"
          :key="item.reviewId"
          class="flex items-center gap-4 p-3 rounded-medium bg-surface-container-low-light"
        >
          <RouterLink
            :to="{ name: 'album', params: { spotifyId: item.album.spotifyId } }"
            class="flex items-center flex-1 min-w-0 gap-4 cursor-pointer"
          >
            <img
              v-if="item.album.coverUrl"
              :src="item.album.coverUrl"
              :alt="`Pochette de ${item.album.title}`"
              class="aspect-square w-16 rounded-small object-cover"
            />
            <div v-else class="aspect-square w-16 rounded-small bg-surface-container-high-light" />

            <div class="flex flex-col flex-1 min-w-0">
              <span class="title-medium truncate">{{ item.album.title }}</span>
              <span class="body-medium text-on-surface-variant-light truncate">
                {{ item.album.artists.join(', ') }}
              </span>
              <span class="body-small text-on-surface-variant-light">
                {{ item.album.releaseYear }}
              </span>
            </div>
          </RouterLink>

          <button
            class="px-4 py-2 rounded-full border border-outline-variant-light label-medium text-on-surface-variant-light cursor-pointer hover:border-error-light hover:text-error-light"
            @click="remove(item)"
          >
            Retirer
          </button>
        </li>
      </ul>
    </div>
  </main>
</template>