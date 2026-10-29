<script setup lang="ts">
import { ref, watch, onMounted, type PropType } from 'vue'
import {
  Ellipsis, Heart, HeartOff, MessageSquareText, Star,
  MessageSquarePlus, Trash2, ChevronRight, Check,
} from 'lucide-vue-next'
import type { AlbumTrackReview } from '@/stores/albumDetail'

const props = defineProps({
  trackNumber: { type: Number, required: true },
  trackTitle: { type: String, required: true },
  artists: { type: Array as PropType<string[]>, default: () => [] },
  review: { type: Object as PropType<AlbumTrackReview | null>, default: null },
})

const emit = defineEmits([
  'updateRating', 'updateComment', 'deleteRating', 'deleteComment',
  'toggleFavorite', 'toggleDisliked',
])

const menuRef = ref<any>(null)
const anchorRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (menuRef.value && anchorRef.value) {
    menuRef.value.anchorElement = anchorRef.value
  }
})

const ratings = [
  { value: 5, label: 'Incroyable', color: 'bg-masterpiece' },
  { value: 4, label: 'Très bien', color: 'bg-great' },
  { value: 3, label: 'Bien', color: 'bg-good' },
  { value: 2, label: 'Moyen', color: 'bg-mid' },
  { value: 1, label: 'À zapper', color: 'bg-skip' },
] as const

function toggleMenu() {
  if (menuRef.value) menuRef.value.open = !menuRef.value.open
}

function closeMenu() {
  if (menuRef.value) menuRef.value.open = false
}

function setRating(value: number) {
  emit('updateRating', value)
  closeMenu()
}
</script>

<template>
  <div class="flex items-center px-4 py-2 gap-3 rounded-extra-small bg-surface-container-low">
    <span class="w-5 text-center title-small text-on-surface-variant">
      {{ trackNumber }}
    </span>

    <div class="flex-1 flex flex-col justify-center min-h-7 gap-0.5">
      <span class="body-medium text-on-surface">{{ trackTitle }}</span>
      <span v-if="artists.length" class="body-small text-outline">
        {{ artists.join(', ') }}
      </span>
    </div>

    <div class="flex items-center gap-2">
      <MessageSquareText v-if="review?.comment" class="w-5 h-5 text-outline" />

      <div v-if="review?.rating" class="flex items-center justify-center w-5 h-5">
        <div class="w-3.5 h-3.5 rounded-full bg-amber-300"></div>
      </div>

      <div class="relative">
        <button
          ref="anchorRef"
          type="button"
          aria-label="Plus d'actions"
          class="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-surface-container-high transition-colors"
          @click="toggleMenu"
        >
          <Ellipsis class="w-6 h-6 text-on-surface-variant" />
        </button>

        <md-menu
          ref="menuRef"
          positioning="popover"
          has-overflow
          anchor-corner="end-end"
          menu-corner="start-end"
        >
          <md-menu-item @click="emit('toggleFavorite')">
            <Heart slot="start" class="w-5 h-5" />
            <div slot="headline">Définir comme favori</div>
          </md-menu-item>

          <md-menu-item @click="emit('toggleDisliked')">
            <HeartOff slot="start" class="w-5 h-5" />
            <div slot="headline">Définir comme moins aimé</div>
          </md-menu-item>

          <md-divider></md-divider>

          <md-sub-menu>
            <md-menu-item slot="item">
              <Star slot="start" class="w-5 h-5" />
              <div slot="headline">Modifier la note</div>
              <ChevronRight slot="end" class="w-5 h-5" />
            </md-menu-item>

            <md-menu slot="menu" positioning="popover">
              <md-menu-item
                v-for="r in ratings"
                :key="r.value"
                @click="setRating(r.value)"
              >
                <div slot="start" class="w-4 h-4 rounded-full" :class="r.color"></div>
                <div slot="headline">{{ r.label }}</div>
                <Check v-if="review?.rating === r.value" slot="end" class="w-5 h-5 text-primary" />
              </md-menu-item>
            </md-menu>
          </md-sub-menu>

          <md-menu-item @click="emit('updateComment')">
            <MessageSquarePlus slot="start" class="w-5 h-5" />
            <div slot="headline">
              {{ review?.comment ? 'Modifier le commentaire' : 'Ajouter un commentaire' }}
            </div>
          </md-menu-item>

          <md-divider></md-divider>

          <md-menu-item :disabled="!review?.rating" @click="emit('deleteRating')">
            <Trash2 slot="start" class="w-5 h-5" />
            <div slot="headline">Supprimer la note</div>
          </md-menu-item>

          <md-menu-item :disabled="!review?.comment" @click="emit('deleteComment')">
            <Trash2 slot="start" class="w-5 h-5" />
            <div slot="headline">Supprimer le commentaire</div>
          </md-menu-item>
        </md-menu>
      </div>
    </div>
  </div>
</template>