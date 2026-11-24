<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import { ArrowUpRight } from '@lucide/vue'
import dev_pic from '@/assets/dev_picture.jpeg'

const router = useRouter()

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="flex flex-col min-w-0 min-h-0 w-full h-full gap-6 overflow-y-auto p-4 sm:p-6 md:rounded-large md:bg-surface-container-lowest">
    <div class="flex items-center gap-2">
      <button
        type="button"
        @click="goBack"
        aria-label="Retour"
        class="flex items-center justify-center aspect-square w-10 rounded-full text-on-surface-variant hover:bg-surface-container-highest active:bg-surface-container-highest transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-6 h-6" />
      </button>
      <h1 class="headline-small text-on-surface">À propos</h1>
    </div>

    <div class="flex flex-col w-full max-w-3xl mx-auto gap-6">
      <div class="flex flex-col sm:flex-row items-center gap-7 px-2">
        <img
          :src="dev_pic"
          alt="Developper picture"
          class="w-36 aspect-square shrink-0 rounded-full object-cover"
        />

        <div class="flex flex-col items-start gap-2">
          <span class="title-large sm:headline-medium text-on-surface">
            Salut, moi c'est <span class="text-primary">Alexis</span>.
          </span>
          <span class="body-large text-on-surface-variant">
            J'ai 20 ans et je suis étudiant en développement d'applications. Ma passion, c'est de concevoir des apps qui ne sont pas seulement utiles, mais surtout agréables à utiliser et à regarder !
          </span>
        </div>
      </div>

      <div class="flex flex-col p-5 sm:p-6 gap-2 rounded-large bg-surface-container sm:bg-surface-container-low">
        <span class="title-large sm:headline-small text-on-surface">
          À propos de <span class="text-primary">AlbumsRating</span>
        </span>
        <span class="body-large text-on-surface-variant">
          J'ai créé cette application pour mettre des mots sur ce que j'écoute,
          garder un œil sur les notes que je donne aux titres et avoir une vision clair de mes albums préférés.
        </span>
      </div>

      <!-- Networks -->
      <div class="flex flex-col gap-0.5 rounded-large overflow-hidden shrink-0">
        <a
          href="https://github.com/xisxis13"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center px-4 py-3 gap-4 rounded-extra-small bg-surface-container sm:bg-surface-container-low hover:bg-surface-container-highest hover:sm:bg-surface-container-high hover:rounded-medium cursor-pointer"
          title="GitHub @xisxis13"
        >
          <span
            class="github-icon aspect-square w-6 shrink-0"
            role="img"
            aria-label="GitHub Icon"
          ></span>
          <div class="flex flex-col flex-1">
            <span class="title-medium text-on-surface">GitHub</span>
            <span class="body-medium text-outline">@xisxis13</span>
          </div>

          <ArrowUpRight class="text-primary w-5 h-5" />
        </a>

        <a
          href="https://www.instagram.com/xisxis_rvc/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center px-4 py-3 gap-4 rounded-extra-small bg-surface-container sm:bg-surface-container-low hover:bg-surface-container-highest hover:sm:bg-surface-container-high hover:rounded-medium cursor-pointer"
          title="Instagram @xisxis_rvc"
        >
          <img class="aspect-square w-6" src="../assets/instagram.svg" alt="Instagram icon" />
          <div class="flex flex-col flex-1">
            <span class="title-medium text-on-surface">Instagram</span>
            <span class="body-medium text-outline">@xisxis_rvc</span>
          </div>

          <ArrowUpRight class="text-primary w-5 h-5" />
        </a>
      </div>
    </div>

    <span class="w-full pt-6 text-center body-medium text-outline">Version : 0.3.3</span>
  </div>
</template>

<style scoped>
.github-icon {
  background-color: var(--on-surface);
  mask: url('../assets/github.svg') no-repeat center / contain;
  -webkit-mask: url('../assets/github.svg') no-repeat center / contain;
}
</style>