<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
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
  <main class="flex flex-col items-center min-h-dvh p-3 bg-surface-light">
    <div class="flex flex-col w-full max-w-2xl p-6 gap-6 rounded-large bg-surface-container-lowest-light">
      <RouterLink to="/" class="label-large text-on-surface-variant-light hover:text-on-surface-light">
        ← Retour
      </RouterLink>

      <h1 class="headline-small">Rechercher un album</h1>

      <form class="flex gap-3" @submit.prevent="submit">
        <input
          v-model="input"
          type="search"
          placeholder="Titre d'album ou artiste"
          class="flex-1 px-6 py-3 rounded-full border border-outline-variant-light bg-surface-light body-large outline-none focus:border-primary-light"
        />
        <button
          type="submit"
          :disabled="searchStore.loading || !input.trim()"
          class="px-6 py-3 rounded-full bg-primary-light text-on-primary-light label-large cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Rechercher
        </button>
      </form>

      <p v-if="searchStore.error" class="body-medium text-error-light">
        {{ searchStore.error }}
      </p>

      <p
        v-else-if="searchStore.hasSearched && !searchStore.loading && searchStore.results.length === 0"
        class="body-medium text-on-surface-variant-light"
      >
        Aucun album trouvé pour « {{ searchStore.query }} ».
      </p>

      <ul v-if="searchStore.results.length" class="flex flex-col gap-3">
        <li
          v-for="album in searchStore.results"
          :key="album.spotifyId"
          class="flex items-center gap-4 p-3 rounded-medium bg-surface-container-low-light"
        >
          <img
            v-if="album.coverUrl"
            :src="album.coverUrl"
            :alt="`Pochette de ${album.title}`"
            class="aspect-square w-16 rounded-small object-cover"
          />
          <div
            v-else
            class="aspect-square w-16 rounded-small bg-surface-container-high-light"
          />

          <div class="flex flex-col min-w-0">
            <span class="title-medium truncate">{{ album.title }}</span>
            <span class="body-medium text-on-surface-variant-light truncate">
              {{ album.artists.map((a) => a.name).join(', ') }}
            </span>
            <span class="body-small text-on-surface-variant-light">
              {{ formatYear(album.releaseDate) }} · {{ album.totalTracks }} titres
            </span>
          </div>
        </li>
      </ul>

      <p v-if="searchStore.loading" class="body-medium text-on-surface-variant-light">
        Recherche en cours…
      </p>

      <button
        v-if="searchStore.results.length && searchStore.results.length < searchStore.total && !searchStore.loading"
        class="px-6 py-3 rounded-full border border-outline-variant-light label-large text-on-surface-variant-light cursor-pointer hover:border-on-surface-light hover:text-on-surface-light"
        @click="searchStore.loadMore()"
      >
        Charger plus de résultats
      </button>
    </div>
  </main>
</template>