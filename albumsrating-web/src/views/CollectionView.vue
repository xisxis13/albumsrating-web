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
  <div class="flex flex-col min-w-0 min-h-0 w-full h-full p-4 sm:p-6 gap-6 overflow-scroll md:rounded-large md:bg-surface-container-lowest">
    <div class="flex justify-between gap-4">
      <h1 class="headline-small text-on-surface">Ma collection</h1>
      <span
        v-if="collectionStore.loaded"
        class="body-medium text-on-surface-variant"
      >
        {{ collectionStore.count }} album{{ collectionStore.count > 1 ? 's' : '' }}
      </span>
    </div>

    <p
      v-if="collectionStore.loading && !collectionStore.loaded"
      class="body-large text-on-surface-variant"
    >
      Chargement...
    </p>

    <p
      v-if="collectionStore.error"
      class="body-large text-error"
    >
      {{ collectionStore.error }}
    </p>

    <div
      v-else-if="collectionStore.loaded && collectionStore.count === 0"
      class="flex flex-col items-center justify-center w-full h-full gap-3"
    >
      <EighthNotes class="w-12 h-12 text-primary" />
      <p class="title-medium text-on-surface">Votre collection est vide</p>
      <p class="body-medium text-on-surface-variant">Ajouter des albums depuis la recherche pour les voir apparaitre ici</p>
      <RouterLink
        to="/search"
        class="px-6 py-3 rounded-full border border-outline-variant label-large text-on-surface-variant cursor-pointer hover:border-primary hover:text-primary"
      >
        Rechercher un album
      </RouterLink>
    </div>

    <ul v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3 sm:gap-4">
      <li
        v-for="item in collectionStore.items"
        :key="item.reviewId"
      >
        <CollectionCardItem
          :to="`/album/${item.album.spotifyId}`"
          :album="item.album"
          :average-rating="item.album.review.averageRating!!"
          :rated-tracks="item.album.tracks.filter(t => t.review?.rating != null).length"
          :total-tracks="item.album.tracks.length"
          @remove="remove(item)"
        />
      </li>
    </ul>
  </div>
</template>