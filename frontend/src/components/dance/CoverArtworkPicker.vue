<template>
  <div class="cover-artwork-picker">
    <!-- Single Unified Cover Selector Block -->
    <div class="cover-selector-box q-mb-md">
      <div class="cover-selector-header">
        <div class="cover-header-title">
          <span class="cover-label">Cover Artwork</span>
          <small v-if="coverMode === 'auto' && hasYouTubeSource && !coverExplicitlyReset" class="cover-badge text-primary">· YouTube Thumbnail</small>
          <small v-else-if="coverFile" class="cover-badge text-positive">· Selected File</small>
          <small v-else-if="isServerUploadedCover" class="cover-badge text-positive">· Uploaded File</small>
          <small v-else-if="coverImage && isUsableCover(coverImage)" class="cover-badge text-positive">· Custom URL</small>
          <small v-else class="cover-badge text-grey">· Default Cover</small>
        </div>

        <div class="cover-header-controls">
          <!-- Inline Confirmation when user requests Reset -->
          <div class="preview-confirm-bar" v-if="confirmingReset">
            <span class="confirm-text">Reset to default?</span>
            <button type="button" class="confirm-reset-btn" @click="executeCoverReset">Yes</button>
            <button type="button" class="cancel-reset-btn" @click="confirmingReset = false">Cancel</button>
          </div>

          <!-- Inline Undo Banner after resetting -->
          <div class="preview-undo-bar" v-else-if="hasRecentReset">
            <span class="undo-text">Reset to default.</span>
            <button type="button" class="undo-reset-btn" @click="undoCoverReset">↺ Undo</button>
            <button type="button" class="dismiss-undo-btn" @click="hasRecentReset = false" title="Dismiss">✕</button>
          </div>

          <button
            v-else-if="hasCustomCover"
            type="button"
            class="clear-cover-btn"
            @click="requestCoverReset"
          >
            ✕ Reset to Default
          </button>
        </div>
      </div>

      <div class="cover-tabs">
        <button
          type="button"
          :class="{ active: coverMode === 'auto' }"
          @click="setCoverMode('auto')"
        >
          ✦ Auto / YouTube
        </button>
        <button
          type="button"
          :class="{ active: coverMode === 'file' }"
          @click="setCoverMode('file')"
        >
          📁 Upload File
        </button>
        <button
          type="button"
          :class="{ active: coverMode === 'url' }"
          @click="setCoverMode('url')"
        >
          🔗 Image URL
        </button>
      </div>

      <div class="cover-body-row">
        <div class="cover-tab-content">
          <div v-if="coverMode === 'auto'" class="cover-tab-auto">
            <span v-if="hasYouTubeSource && !coverExplicitlyReset">✓ Auto-detecting video thumbnail from your YouTube tutorial link.</span>
            <span v-else>Paste a YouTube tutorial link below to auto-fetch video artwork, or use the default vector cover.</span>
          </div>

          <div
            v-else-if="coverMode === 'file'"
            class="cover-tab-file"
            :class="{ 'is-dragging': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDropFile"
          >
            <button
              type="button"
              class="file-upload-btn"
              :class="{ 'file-upload-btn-dragging': isDragging }"
              @click="triggerFileInput"
            >
              📁 {{ coverFile ? coverFile.name : (isServerUploadedCover ? 'Existing uploaded file (click or drop to replace)...' : 'Choose or drop an image file (JPEG, PNG, WebP up to 2MB)...') }}
            </button>
            <small v-if="fileError" class="text-negative q-mt-xs" style="display: block;">{{ fileError }}</small>
          </div>

          <div v-else class="cover-tab-url">
            <div class="url-input-group">
              <input
                v-model.trim="tempUrlInput"
                type="url"
                placeholder="https://example.com/dance-cover.jpg"
                :disabled="urlTesting"
                @keydown.enter.prevent="applyUrlInput"
              >
              <button
                type="button"
                class="apply-url-btn"
                :disabled="!tempUrlInput || urlTesting"
                @click="applyUrlInput"
              >
                {{ urlTesting ? 'Testing…' : 'Apply' }}
              </button>
            </div>
            <small v-if="urlError" class="text-negative q-mt-xs">{{ urlError }}</small>
          </div>
        </div>

        <!-- Live Preview Thumbnail integrated directly in the card -->
        <div
          class="preview-img-wrapper"
          :title="coverMode === 'file' ? 'Click to choose a file' : 'Cover artwork preview'"
          @click="coverMode === 'file' ? triggerFileInput() : null"
        >
          <img
            :src="previewCoverSrc"
            alt="Cover preview"
            @error="handleImageError"
          >
          <span v-if="coverMode === 'file'" class="preview-overlay-hint">Change</span>
        </div>
      </div>
    </div>

    <!-- Hidden native file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      style="display: none;"
      @change="onSelectCoverFile"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDanceStore, isUsableCover, extractYouTubeId } from '../../stores/danceStore'

const props = defineProps<{
  coverImage: string
  coverFile: File | null
  sourceLink?: string
}>()

const emit = defineEmits<{
  (e: 'update:coverImage', value: string): void
  (e: 'update:coverFile', value: File | null): void
}>()

const store = useDanceStore()

const coverMode = ref<'auto' | 'file' | 'url'>('auto')
const fileInputRef = ref<HTMLInputElement | null>(null)
const tempUrlInput = ref('')
const urlError = ref('')
const fileError = ref('')
const isDragging = ref(false)
const urlTesting = ref(false)

const confirmingReset = ref(false)
const hasRecentReset = ref(false)
const coverExplicitlyReset = ref(false)

interface CoverBackup {
  coverImage: string
  coverFile: File | null
  coverMode: 'auto' | 'file' | 'url'
}
const lastCoverBackup = ref<CoverBackup | null>(null)

// Initialize mode based on props
watch(
  () => [props.coverImage, props.coverFile],
  () => {
    if (props.coverFile) {
      coverMode.value = 'file'
    } else if (props.coverImage && isUsableCover(props.coverImage)) {
      if (props.coverImage.startsWith('/storage/')) {
        coverMode.value = 'file'
      } else if (props.coverImage.includes('img.youtube.com') || props.coverImage.includes('youtube.com')) {
        coverMode.value = 'auto'
      } else {
        coverMode.value = 'url'
      }
    } else {
      coverMode.value = 'auto'
    }
  },
  { immediate: true }
)

// Auto-sync YouTube thumbnail when in auto mode and sourceLink changes
watch(
  () => props.sourceLink,
  (newLink) => {
    if (coverMode.value === 'auto') {
      const ytId = extractYouTubeId(newLink || '')
      if (ytId) {
        emit('update:coverImage', `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`)
        emit('update:coverFile', null)
        coverExplicitlyReset.value = false
      }
    }
  }
)

const hasYouTubeSource = computed(() => Boolean(extractYouTubeId(props.sourceLink || '')))
const hasCustomCover = computed(() => Boolean(props.coverFile || (props.coverImage && isUsableCover(props.coverImage))))

const isServerUploadedCover = computed(() => {
  return Boolean(
    props.coverImage &&
    props.coverImage.startsWith('/storage/') &&
    !props.coverFile
  )
})

const previewCoverSrc = computed(() => {
  if (coverMode.value === 'auto') {
    const ytId = extractYouTubeId(props.sourceLink || '')
    if (ytId && !coverExplicitlyReset.value) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    }
    return store.defaultCover
  }
  if (props.coverFile) {
    return props.coverImage
  }
  if (props.coverImage && isUsableCover(props.coverImage)) {
    return props.coverImage
  }
  return store.defaultCover
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function applyUrlInput() {
  const raw = tempUrlInput.value.trim()
  if (!raw) {
    requestCoverReset()
    return
  }

  const ytId = extractYouTubeId(raw)
  const normalized = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/') ? raw : `https://${raw}`)

  if (!isUsableCover(normalized)) {
    urlError.value = 'Please enter a valid image web URL.'
    return
  }

  urlTesting.value = true
  urlError.value = ''

  const probe = new Image()
  probe.onload = () => {
    urlTesting.value = false
    emit('update:coverFile', null)
    if (fileInputRef.value) fileInputRef.value.value = ''
    emit('update:coverImage', normalized)
    coverMode.value = ytId ? 'auto' : 'url'
    coverExplicitlyReset.value = false
    hasRecentReset.value = false
    urlError.value = ''
  }
  probe.onerror = () => {
    urlTesting.value = false
    urlError.value = 'Could not load an image from this URL. Please verify the link is accessible.'
  }
  probe.src = normalized
}

function requestCoverReset() {
  confirmingReset.value = true
  hasRecentReset.value = false
  urlError.value = ''
}

function executeCoverReset() {
  lastCoverBackup.value = {
    coverImage: props.coverImage,
    coverFile: props.coverFile,
    coverMode: coverMode.value
  }
  emit('update:coverImage', '')
  emit('update:coverFile', null)
  coverMode.value = 'auto'
  coverExplicitlyReset.value = true
  confirmingReset.value = false
  hasRecentReset.value = true
  urlError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function undoCoverReset() {
  if (!lastCoverBackup.value) return
  emit('update:coverImage', lastCoverBackup.value.coverImage)
  emit('update:coverFile', lastCoverBackup.value.coverFile)
  coverMode.value = lastCoverBackup.value.coverMode
  coverExplicitlyReset.value = false
  hasRecentReset.value = false
  urlError.value = ''
}

function handleFileSelection(file: File | null) {
  if (!file) return
  fileError.value = ''

  if (!file.type.startsWith('image/')) {
    fileError.value = 'Please select a valid image file (JPEG, PNG, WebP).'
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    fileError.value = 'Cover image must be 2MB or less.'
    return
  }

  emit('update:coverFile', file)
  emit('update:coverImage', URL.createObjectURL(file))
  coverMode.value = 'file'
  coverExplicitlyReset.value = false
  confirmingReset.value = false
  hasRecentReset.value = false
  urlError.value = ''
  fileError.value = ''
}

function onDropFile(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0] || null
  handleFileSelection(file)
}

function onSelectCoverFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  handleFileSelection(file)
}

function setCoverMode(mode: 'auto' | 'file' | 'url') {
  coverMode.value = mode
  if (mode === 'auto') {
    confirmingReset.value = false
    const ytId = extractYouTubeId(props.sourceLink || '')
    if (ytId) {
      emit('update:coverImage', `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`)
      emit('update:coverFile', null)
      coverExplicitlyReset.value = false
    } else {
      emit('update:coverImage', '')
      emit('update:coverFile', null)
    }
  } else if (mode === 'file') {
    triggerFileInput()
  } else if (mode === 'url') {
    tempUrlInput.value = props.coverImage && !props.coverFile && !props.coverImage.startsWith('/storage/')
      ? props.coverImage
      : ''
    urlError.value = ''
  }
}

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = store.defaultCover
}

defineExpose({
  resetState() {
    coverMode.value = 'auto'
    coverExplicitlyReset.value = false
    confirmingReset.value = false
    hasRecentReset.value = false
    lastCoverBackup.value = null
    tempUrlInput.value = ''
    urlError.value = ''
    urlTesting.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
})
</script>

<style scoped>
.file-upload-btn-dragging {
  border-color: var(--accent) !important;
  background: rgba(184, 108, 255, 0.15) !important;
  transform: scale(1.02);
}
</style>

