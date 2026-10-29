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
    `Retirer « ${item.album.title} » de votre collection ?\nVos notes et commentaires sur cet album seront supprimés.`
  )

  if (confirmed) collectionStore.removeAlbum(item.reviewId)
}
</script>

<template>
  <main class="flex items-center justify-center h-dvh p-3 bg-surface-light">
    <div class="flex flex-col w-full h-full p-6 gap-6 rounded-large bg-surface-container-lowest-light">
      <div class="flex justify-between">
        <h1 class="title-large">Ma collection</h1>
        <span
          v-if="collectionStore.loaded"
        >
          {{ collectionStore.count }} album{{ collectionStore.count > 1 ? 's' : '' }}
        </span>
      </div>

      <p
        v-if="collectionStore.loading && !collectionStore.loaded"
      >
        Chargement...
      </p>

      <p
        v-if="collectionStore.error"
        class="text-error-light"
      >
        {{ collectionStore.error }}
      </p>

      <div
        v-else-if="collectionStore.loaded && collectionStore.count === 0"
      >
        <p>Votre collection est vide pour l'instant.</p>
        <RouterLink
          to="/search"
          class="border bg-amber-400"
        >
          Rechercher un album
        </RouterLink>
      </div>

      <ul
        v-else
        class="flex flex-col gap-3"
      >
        <li
          v-for="item in collectionStore.items"
          :key="item.reviewId"
          class="flex gap-2 bg-gray-300"
        >
          <img
            v-if="item.album.coverUrl"
            :src="item.album.coverUrl"
            :alt="`Cover de ${item.album.title}`"
            class="aspect-square w-16 object-cover"
          />
          <div v-else class="aspect-square w-16 bg-green-300" />

          <div class="flex flex-col">
            <span>{{ item.album.title }}</span>
            <span>{{ item.album.artists.join(', ') }}</span>
            <span>{{ item.album.releaseYear }}</span>
          </div>

          <button
            @click="remove(item)"
            class="border bg-error-container-light"
          >
            Retirer
          </button>
        </li>
      </ul>
    </div>
  </main>
</template>