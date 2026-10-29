<script setup lang="ts">
import { ref } from 'vue'
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()
const input = ref(searchStore.query)

function submit() {
  searchStore.search(input.value)
}

function formatYear(date: string) {
  return date.slice(0, 4)
}
</script>

<template>
  <main class="flex items-center justify-center h-dvh p-3 gap-3 bg-surface">
    <div class="flex flex-col w-full h-full p-6 gap-6 overflow-scroll rounded-large bg-surface-container-lowest">
      <h1 class="headline-small text-on-surface">Rechercher un album</h1>

      <form 
        @submit.prevent="submit"
        class="flex gap-3"
      >
        <input 
          v-model="input"
          type="search"
          placeholder="Titre d'album ou artiste"
          class="border"
        >

        <button
          type="submit"
          :disabled="searchStore.loading || !input.trim()"
          class="border bg-amber-500"
        >
          Rechercher
        </button>
      </form>

      <p
        v-if="searchStore.error"
        class="text-error-light"
      >
        {{ searchStore.error }}
      </p>

      <p
        v-else-if="searchStore.hasSearched && !searchStore.loadMore && searchStore.results.length === 0"
      >
        Aucun album trouvé pour "{{ searchStore.query }}"
      </p>

      <ul
        v-if="searchStore.results.length"
        class="flex flex-col gap-2"
      >
        <li
          v-for="album in searchStore.results"
          :key="album.spotifyId"
          class="flex gap-4 h-20 bg-gray-200"
        >
          <img 
            v-if="album.coverUrl"
            :src="album.coverUrl"
            :alt="`Cover de ${album.title}`"
            class="w-10"
          >

          <div class="flex flex-col">
            <span>{{ album.title }}</span>
            <span>{{ album.artists.map((a) => a.name).join(', ') }}</span>
            <span>{{ formatYear(album.releaseDate) }} • {{ album.totalTracks }} titres</span>
          </div>
        </li>
      </ul>

      <p
        v-if="searchStore.loading"
      >
        Recherche en cours...
      </p>

      <button
        v-if="searchStore.results.length && searchStore.results.length < searchStore.total && !searchStore.loading"
        @click="searchStore.loadMore()"
        class="border bg-amber-500"
      >
        Charger plus de résultat
      </button>
    </div>
  </main>
</template>