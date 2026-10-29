<template>
  <article
    class="dance-card"
    role="button"
    tabindex="0"
    :aria-label="`Open ${dance.title} by ${dance.artist}`"
    @click="emit('open', dance)"
    @keydown.enter.prevent="emit('open', dance)"
    @keydown.space.prevent="emit('open', dance)"
  >
    <div class="card-image">
      <DanceCoverImage
        :dance="dance"
        :alt="dance.title"
      />

      <!-- Reusable Status Badge -->
      <StatusBadge
        :status="dance.status"
        :progress="dance.progress"
        :is-trending="isTrending"
        :rank="dance.rank"
        :is-uploaded="isUploaded || dance.status === 'Uploaded'"
        mode="card"
      />

      <!-- Favorite Button -->
      <button
        class="favorite-btn"
        :class="{ liked: isFav, 'favorite-pulse': pulseActive }"
        aria-label="Toggle favorite"
        @click.stop="onToggleFavorite"
      >
        ♥
      </button>
    </div>

    <div class="card-body">
      <div class="card-title-row">
        <h3>{{ dance.title }}</h3>
        <span class="category-dot"></span>
      </div>
      <p>{{ dance.artist }}</p>

      <!-- Progress Line -->
      <div class="progress-line" v-if="showProgress">
        <span :style="{ width: dance.progress + '%' }"></span>
      </div>

      <!-- Card Meta -->
      <div class="card-meta">
        <template v-if="isTrending">
          <span>{{ dance.category }} · {{ dance.difficulty }}</span>
          <span>{{ dance.progress }}%</span>
        </template>
        <template v-else>
          <span>{{ dance.status === 'Uploaded' ? 'Uploaded' : (dance.progress >= 100 ? '100% mastered' : dance.progress + '% learned') }}</span>
          <a
            v-if="isUploaded && dance.uploadLink"
            :href="dance.uploadLink"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            View video ↗
          </a>
          <span v-else>{{ dance.category }}</span>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDanceStore } from '../stores/danceStore'
import DanceCoverImage from './common/DanceCoverImage.vue'
import StatusBadge from './common/StatusBadge.vue'
import type { Dance } from '../services/danceService'

const props = withDefaults(
  defineProps<{
    dance: Dance
    activeView?: string
    isTrending?: boolean
    isUploaded?: boolean
  }>(),
  {
    activeView: 'home',
    isTrending: false,
    isUploaded: false
  }
)

const emit = defineEmits<{
  (e: 'open', dance: Dance): void
  (e: 'toggleFavorite', dance: Dance): void
}>()

const store = useDanceStore()

const isFav = computed(() => store.isFavorite(props.dance))
const pulseActive = computed(() => store.favoritePulseId === props.dance.id)

const showProgress = computed(() => {
  if (props.dance.status === 'Uploaded') return false
  return props.dance.progress !== undefined
})

function onToggleFavorite() {
  emit('toggleFavorite', props.dance)
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
