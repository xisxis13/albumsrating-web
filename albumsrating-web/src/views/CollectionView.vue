<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCollectionStore, type CollectionItem } from '@/stores/collection'
import { EighthNotes } from '@lucide/vue'
import NavigationRail from '@/components/NavigationRail.vue'
import CollectionCardItem from '@/components/CollectionCardItem.vue'

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
  <main class="flex items-center justify-center h-dvh p-3 gap-3">
    <NavigationRail />

    <div class="flex flex-col w-full h-full p-6 gap-6 overflow-scroll rounded-large bg-surface-container-lowest-light">
      <div class="flex justify-between gap-4">
        <h1 class="headline-small text-on-surface-light">Ma collection</h1>
        <span
          v-if="collectionStore.loaded"
          class="text-body-medium text-on-surface-variant-light"
        >
          {{ collectionStore.count }} album{{ collectionStore.count > 1 ? 's' : '' }}
        </span>
      </div>

      <p
        v-if="collectionStore.loading && !collectionStore.loaded"
        class="text-body-large text-on-surface-variant-light"
      >
        Chargement...
      </p>

      <p
        v-if="collectionStore.error"
        class="text-body-large text-error-light"
      >
        {{ collectionStore.error }}
      </p>

      <div
        v-else-if="collectionStore.loaded && collectionStore.count === 0"
        class="flex flex-col items-center justify-center w-full h-full gap-3"
      >
        <EighthNotes class="w-12 h-12 text-primary-light" />
        <p class="text-title-medium text-on-surface-light">Votre collection est vide</p>
        <p class="text-body-medium text-on-surface-variant-light">Ajouter des albums depuis la recherche pour les voir apparaitre ici</p>
        <RouterLink
          to="/search"
          class="px-6 py-3 rounded-full border border-outline-variant-light text-label-large text-on-surface-variant-light cursor-pointer hover:border-primary-light hover:text-primary-light"
        >
          Rechercher un album
        </RouterLink>
      </div>

      <ul v-else class="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
        <li
          v-for="item in collectionStore.items"
          :key="item.reviewId"
        >
          <CollectionCardItem
            :to="`/album/${item.album.spotifyId}`"
            :album="item.album"
            @remove="remove(item)"
          />
        </li>
      </ul>
    </div>
  </main>
</template>