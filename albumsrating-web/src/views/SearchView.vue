<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSearchStore } from '@/stores/search'
import { useCollectionStore } from '@/stores/collection'
import NavigationRail from '@/components/NavigationRail.vue'
import SearchResultItem from '@/components/SearchResultItem.vue'

const searchStore = useSearchStore()
const collectionStore = useCollectionStore()
const input = ref(searchStore.query)

onMounted(() => {
  collectionStore.fetchCollection()
})

function submit() {
  searchStore.search(input.value)
}

function formatYear(date: string) {
  return date.slice(0, 4)
}
</script>

<template>
  <main class="flex items-center justify-center h-dvh p-3 gap-3 bg-surface">
    <NavigationRail />

    <div class="flex flex-col w-full h-full p-6 gap-6 overflow-scroll rounded-large bg-surface-container-lowest">
      <h1 class="headline-small text-on-surface">Rechercher un album</h1>

      <form class="flex gap-3" @submit.prevent="submit">
        <input
          v-model="input"
          type="search"
          placeholder="Titre d'album ou artiste"
          class="flex-1 px-6 py-3 rounded-full border border-outline-variant bg-surface body-large text-on-surface-variant outline-none focus:border-primary"
        />

        <button
          type="submit"
          :disabled="searchStore.loading || !input.trim()"
          class="px-6 py-3 rounded-full bg-primary text-on-primary label-large cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Rechercher
        </button>
      </form>

      <p v-if="searchStore.error" class="body-medium text-error">
        {{ searchStore.error }}
      </p>

      <p v-if="collectionStore.error" class="body-medium text-error">
        {{ collectionStore.error }}
      </p>

      <p
        v-else-if="searchStore.hasSearched && !searchStore.loading && searchStore.results.length === 0"
        class="body-medium text-on-surface-variant"
      >
        Aucun album trouvé pour « {{ searchStore.query }} ».
      </p>

      <ul v-if="searchStore.results.length" class="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
        <li
          v-for="album in searchStore.results"
          :key="album.spotifyId"
        >
          <SearchResultItem
            :to="`/album/${album.spotifyId}`"
            :album="album"
            :is-in-collection="collectionStore.has(album.spotifyId)"
            :is-adding="collectionStore.isAdding(album.spotifyId)"
            @add="collectionStore.addAlbum(album.spotifyId)"
          />
        </li>
      </ul>

      <p v-if="searchStore.loading" class="body-medium text-on-surface-variant">
        Recherche en cours…
      </p>

      <button
        v-if="searchStore.results.length && searchStore.results.length < searchStore.total && !searchStore.loading"
        class="px-6 py-3 rounded-full border border-outline-variant label-large text-on-surface-variant cursor-pointer hover:border-on-surface hover:text-on-surface"
        @click="searchStore.loadMore()"
      >
        Charger plus de résultats
      </button>
    </div>
  </main>
</template>