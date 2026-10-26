<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCollectionStore, type CollectionItem } from '@/stores/collection'
import NavigationRail from '@/components/NavigationRail.vue'
import CollectionResultItem from '@/components/CollectionResultItem.vue'

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
  <main class="flex items-center justify-center h-dvh p-3 gap-3 bg-surface-light">
    <NavigationRail /> 

    <div class="flex flex-col w-full h-full p-6 gap-6 rounded-large bg-surface-container-lowest-light overflow-scroll">
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

      <ul v-else class="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
        <li
          v-for="item in collectionStore.items"
          :key="item.reviewId"
        >
          <CollectionResultItem
            :to="`/album/${item.album.spotifyId}`"
            :album="item.album"
            @remove="remove(item)"
          />
        </li>
      </ul>
    </div>
  </main>
</template>