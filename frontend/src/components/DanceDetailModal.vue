<template>
  <q-dialog
    :model-value="Boolean(dance)"
    transition-show="scale"
    transition-hide="scale"
    @update:model-value="onDialogChange"
  >
    <div
      v-if="dance"
      class="detail-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="`${dance.title} details`"
    >
      <button class="close-btn" @click="emit('close')" aria-label="Close modal">×</button>
      
      <div class="detail-cover">
        <DanceCoverImage
          :dance="dance"
          :alt="dance.title"
        />
      </div>

      <div class="detail-content">
        <div class="detail-heading">
          <div>
            <span class="eyebrow">{{ dance.category }} · {{ dance.difficulty }}</span>
            <h2>{{ dance.title }}</h2>
            <p>{{ dance.artist }}</p>
          </div>
          <button
            class="favorite-large"
            :class="{ liked: isFav, 'favorite-pulse': pulseActive }"
            aria-label="Toggle favorite"
            @click="store.toggleFavorite(dance)"
          >
            ♥
          </button>
        </div>

        <StatusBadge
          :status="dance.status"
          :progress="dance.progress"
          mode="detail"
        />

        <!-- Progress Section -->
        <div class="detail-progress">
          <div class="detail-progress-header">
            <strong>Learning Progress</strong>
            <span>{{ localProgress }}%</span>
          </div>
          <input
            class="progress-scrubber"
            type="range"
            min="0"
            max="100"
            step="1"
            :value="localProgress"
            :style="{
              background: `linear-gradient(90deg, #9333ea 0%, #c084fc ${localProgress}%, rgba(255, 255, 255, 0.1) ${localProgress}%, rgba(255, 255, 255, 0.1) 100%)`
            }"
            aria-label="Learning progress"
            @input="onScrubProgress"
            @change="onCommitProgress"
          >
          <div class="progress-actions">
            <button type="button" @click="adjustProgress(-10)">−10%</button>
            <button type="button" @click="adjustProgress(10)">+10%</button>
            <button
              type="button"
              :class="{ active: localProgress === 50 }"
              @click="setProgress(50)"
            >
              50% Halfway
            </button>
            <button
              type="button"
              :class="{ active: localProgress === 80 }"
              @click="setProgress(80)"
            >
              80% Ready
            </button>
            <button
              type="button"
              :class="{ active: localProgress === 100 }"
              @click="setProgress(100)"
            >
              ⭐ 100% Mastered
            </button>
          </div>

          <!-- Mastery Callout -->
          <div v-if="localProgress >= 100 && !dance.uploadLink" class="mastery-callout">
            ⭐ <strong>100% Mastered:</strong> You have fully memorized the choreography! Ready to film? You can attach your video upload link when you edit this dance.
          </div>
        </div>

        <!-- Embedded Video Tutorial -->
        <div class="video-embed-section" v-if="youtubeEmbedUrl">
          <div class="video-embed-header">
            <span class="eyebrow">TUTORIAL / ORIGINAL VIDEO</span>
            <a
              :href="dance.sourceLink"
              target="_blank"
              rel="noopener noreferrer"
              class="video-external-link"
            >
              Open on YouTube ↗
            </a>
          </div>
          <div class="video-iframe-wrapper">
            <iframe
              :src="youtubeEmbedUrl"
              title="Dance Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        </div>

        <!-- Links -->
        <div class="detail-links" v-if="(dance.sourceLink && !youtubeEmbedUrl) || dance.uploadLink">
          <a
            v-if="dance.sourceLink && !youtubeEmbedUrl"
            :href="dance.sourceLink"
            target="_blank"
            class="secondary-btn"
            rel="noopener noreferrer"
          >
            ▶ Watch Original / Tutorial
          </a>
          <a
            v-if="dance.uploadLink"
            :href="dance.uploadLink"
            target="_blank"
            class="secondary-btn"
            rel="noopener noreferrer"
          >
            ↗ View My Upload
          </a>
        </div>

        <!-- Notes -->
        <div class="notes" v-if="dance.notes">
          <span class="eyebrow">PRACTICE NOTES</span>
          <p>{{ dance.notes }}</p>
        </div>

        <!-- Actions -->
        <div class="detail-actions">
          <button class="secondary-btn" @click="emit('edit', dance)">Edit Dance</button>
          <button class="danger-btn" @click="showDeleteConfirm = true">Delete</button>
        </div>
      </div>
    </div>

    <!-- Custom Delete Confirmation Dialog -->
    <DeleteConfirmModal
      v-if="dance"
      :show="showDeleteConfirm"
      :dance-title="dance.title"
      :loading="store.mutationLoading"
      @confirm="onConfirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDanceStore, extractYouTubeId } from '../stores/danceStore'
import DanceCoverImage from './common/DanceCoverImage.vue'
import StatusBadge from './common/StatusBadge.vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'
import type { Dance } from '../services/danceService'

const props = defineProps<{
  dance: Dance | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', dance: Dance): void
}>()

const store = useDanceStore()

const localProgress = ref(0)
const showDeleteConfirm = ref(false)

watch(
  () => props.dance,
  (val) => {
    localProgress.value = val?.progress ?? 0
    showDeleteConfirm.value = false
  },
  { immediate: true }
)

watch(
  () => props.dance?.progress,
  (val) => {
    if (val !== undefined) {
      localProgress.value = val
    }
  }
)

async function onConfirmDelete() {
  if (!props.dance) return
  const danceToDelete = props.dance
  showDeleteConfirm.value = false
  emit('close')
  await store.confirmDelete(danceToDelete)
}

const isFav = computed(() => (props.dance ? store.isFavorite(props.dance) : false))
const pulseActive = computed(() => (props.dance ? store.favoritePulseId === props.dance.id : false))

const youtubeVideoId = computed(() => {
  if (!props.dance?.sourceLink) return null
  return extractYouTubeId(props.dance.sourceLink)
})

const youtubeEmbedUrl = computed(() => {
  if (!youtubeVideoId.value) return null
  return `https://www.youtube-nocookie.com/embed/${youtubeVideoId.value}?rel=0`
})

function onDialogChange(val: boolean) {
  if (!val) {
    emit('close')
  }
}

function onScrubProgress(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  localProgress.value = Math.min(100, Math.max(0, val))
}

let progressTimer: number | undefined

function onCommitProgress() {
  if (!props.dance) return
  if (progressTimer) window.clearTimeout(progressTimer)
  void store.setProgress(props.dance, localProgress.value)
}

function debouncedSyncProgress(targetValue: number) {
  if (!props.dance) return
  localProgress.value = Math.min(100, Math.max(0, targetValue))
  if (progressTimer) window.clearTimeout(progressTimer)
  progressTimer = window.setTimeout(() => {
    if (props.dance) {
      void store.setProgress(props.dance, localProgress.value)
    }
  }, 250)
}

function adjustProgress(amount: number) {
  debouncedSyncProgress(localProgress.value + amount)
}

function setProgress(amount: number) {
  debouncedSyncProgress(amount)
}
</script>
