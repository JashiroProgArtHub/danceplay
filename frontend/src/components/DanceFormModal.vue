<template>
  <q-dialog
    :model-value="show"
    persistent
    transition-show="scale"
    transition-hide="scale"
    @escape-key="attemptClose"
  >
    <div class="form-modal-container" style="width: 100%; display: flex; justify-content: center; pointer-events: all;">
      <form class="form-modal" @submit.prevent="onSave">
        <button type="button" class="close-btn" @click="attemptClose" aria-label="Close modal">×</button>
        <span class="eyebrow">{{ editingDance ? 'UPDATE YOUR ROUTINE' : 'ADD TO YOUR COLLECTION' }}</span>
        <h2>{{ editingDance ? 'Edit Dance' : 'Add a Dance' }}</h2>
        <p class="form-intro">
          {{ editingDance ? 'Update the dance details or add optional practice resources.' : 'Save the dance first, then add a reference video or notes whenever you are ready.' }}
        </p>

        <fieldset :disabled="store.mutationLoading" style="border: 0; padding: 0; margin: 0; min-width: 0;">
        <!-- SECTION 1: ESSENTIALS (QUICK ADD) -->
        <div class="form-section-heading">
          <strong>Dance details</strong>
          <span>Required to add a dance</span>
        </div>
        <div class="form-grid">
          <label>
            Dance Name *
            <input v-model.trim="form.title" required placeholder="e.g. Magnetic">
          </label>
          <label>
            Artist / Creator *
            <input v-model.trim="form.artist" required placeholder="e.g. ILLIT">
          </label>
          <label>
            Category *
            <select v-model="form.category" required>
              <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </label>
          <label>
            Difficulty *
            <select v-model="form.difficulty" required>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </label>
        </div>

        <!-- SECTION 2: PROGRESSIVE DISCLOSURE (PRACTICE DETAILS & LINKS) -->
        <div class="form-collapsible">
          <button
            type="button"
            class="form-collapse-toggle"
            @click="detailsOpen = !detailsOpen"
          >
            <span class="toggle-icon">{{ detailsOpen ? '▼' : '▶' }}</span>
            <span>Practice Milestones, Links & Notes</span>
            <span v-if="!detailsOpen && hasOptionalContent" class="toggle-pill">Configured</span>
          </button>

          <div v-show="detailsOpen" class="form-collapse-body">
            <p class="optional-fields-hint">
              All fields in this section are optional. Add a reference link now or attach one later.
            </p>
            <!-- Interactive Milestone Presets & Progress -->
            <div class="milestone-selector-block q-mb-md">
              <div class="milestone-header">
                <label class="milestone-title">Practice Milestone</label>
                <span class="milestone-progress-value">{{ form.progress || 0 }}% Learned</span>
              </div>

              <!-- Milestone Chips -->
              <div class="milestone-chips">
                <button
                  type="button"
                  class="milestone-chip"
                  :class="{ active: computedMilestone === 'want' }"
                  @click="setMilestone('want')"
                >
                  <span class="chip-icon">💭</span>
                  <span class="chip-label">Want to Learn</span>
                  <span class="chip-percent">0%</span>
                </button>

                <button
                  type="button"
                  class="milestone-chip"
                  :class="{ active: computedMilestone === 'learning' }"
                  @click="setMilestone('learning')"
                >
                  <span class="chip-icon">◌</span>
                  <span class="chip-label">Learning</span>
                  <span class="chip-percent">50%</span>
                </button>

                <button
                  type="button"
                  class="milestone-chip"
                  :class="{ active: computedMilestone === 'ready' }"
                  @click="setMilestone('ready')"
                >
                  <span class="chip-icon">🎥</span>
                  <span class="chip-label">Ready to Film</span>
                  <span class="chip-percent">80%</span>
                </button>

                <button
                  type="button"
                  class="milestone-chip"
                  :class="{ active: computedMilestone === 'uploaded' }"
                  @click="setMilestone('uploaded')"
                >
                  <span class="chip-icon">✓</span>
                  <span class="chip-label">Uploaded</span>
                  <span class="chip-percent">100%</span>
                </button>
              </div>

              <!-- Progress Scrubber Slider -->
              <input
                v-model.number="form.progress"
                type="range"
                min="0"
                max="100"
                step="1"
                class="progress-scrubber"
                :style="{
                  background: `linear-gradient(90deg, #9333ea 0%, #c084fc ${form.progress || 0}%, rgba(255, 255, 255, 0.1) ${form.progress || 0}%, rgba(255, 255, 255, 0.1) 100%)`
                }"
                aria-label="Practice progress"
              >

              <!-- Milestone Status Callout -->
              <div class="milestone-helper-callout">
                <span v-if="computedStatus === 'Uploaded'">
                  ✓ <strong>Uploaded:</strong> Performance video link attached. Completed!
                </span>
                <span v-else-if="form.progress >= 100">
                  ⭐ <strong>100% Mastered:</strong> Routine fully memorized! Attach your upload link below when you film your performance.
                </span>
                <span v-else-if="computedStatus === 'Ready to Film'">
                  🎥 <strong>Ready to Film ({{ form.progress }}%):</strong> Reached filming readiness (≥ 75%).
                </span>
                <span v-else-if="computedStatus === 'Learning'">
                  ◌ <strong>In Practice ({{ form.progress }}%):</strong> Actively practicing the choreography.
                </span>
                <span v-else>
                  💭 <strong>Want to Learn:</strong> In queue (0%). Ready to start!
                </span>
              </div>
            </div>

            <!-- Video Links & Notes -->
            <div class="form-grid">
              <label class="full">
                Original Dance / Tutorial Link
                <input
                  v-model.trim="form.sourceLink"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  :aria-invalid="Boolean(sourceLinkError)"
                  @blur="onNormalizeLinks"
                >
                <small>YouTube links automatically enable the in-app practice player and auto-cover.</small>
                <small v-if="sourceLinkError" class="field-error">{{ sourceLinkError }}</small>
              </label>
              <label class="full">
                My Upload Link
                <input
                  v-model.trim="form.uploadLink"
                  type="url"
                  placeholder="https://www.tiktok.com/@dancer/video/..."
                  :aria-invalid="Boolean(uploadLinkError)"
                  @blur="onNormalizeLinks"
                >
                <small>Attaching your cover performance link automatically marks the routine as Uploaded.</small>
                <small v-if="uploadLinkError" class="field-error">{{ uploadLinkError }}</small>
              </label>
              <label class="full">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span>Choreography Notes</span>
                  <span style="font-size: 10px; font-weight: 400; color: var(--muted);">{{ form.notes?.length || 0 }}/500</span>
                </div>
                <textarea
                  v-model.trim="form.notes"
                  rows="3"
                  maxlength="500"
                  placeholder="Key 8-counts, tricky footwork transitions, formation cues..."
                ></textarea>
              </label>
            </div>
          </div>
        </div>

        <!-- SECTION 3: COVER ARTWORK PICKER (MODULARIZED DOMAIN COMPONENT) -->
        <CoverArtworkPicker
          ref="coverPickerRef"
          v-model:cover-image="form.coverImage"
          v-model:cover-file="form.coverFile"
          :source-link="form.sourceLink"
        />
        </fieldset>

        <!-- FORM ACTIONS -->
        <div class="form-actions" :class="{ 'has-delete': Boolean(editingDance) }">
          <button
            v-if="editingDance"
            type="button"
            class="danger-btn-subtle"
            @click="showDeleteConfirm = true"
          >
            🗑 Delete Routine
          </button>
          <div class="form-primary-actions">
            <button type="button" class="secondary-btn" @click="attemptClose">Cancel</button>
            <button type="submit" class="primary-btn" :disabled="store.mutationLoading">
              {{ store.mutationLoading ? 'Saving…' : (editingDance ? 'Save Changes' : 'Add Dance') }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- CUSTOM DISCARD CONFIRMATION DIALOG -->
    <q-dialog
      v-model="showDiscardConfirm"
      persistent
      transition-show="scale"
      transition-hide="scale"
      @escape-key="showDiscardConfirm = false"
    >
      <div class="custom-confirm-card warning-card" role="alertdialog" aria-modal="true">
        <div class="confirm-icon-wrapper warning-icon">
          <span>⚠️</span>
        </div>
        <span class="eyebrow" style="color: #ffb86c;">UNSAVED CHANGES</span>
        <h3>Discard Your Changes?</h3>
        <p>
          You have unsaved changes to this routine. If you discard now, your edits will not be saved.
        </p>
        <div class="confirm-actions">
          <button type="button" class="secondary-btn" @click="showDiscardConfirm = false">
            Keep Editing
          </button>
          <button type="button" class="danger-btn" @click="forceClose">
            Discard Changes
          </button>
        </div>
      </div>
    </q-dialog>

    <!-- CUSTOM DELETE CONFIRMATION DIALOG (WHEN EDITING) -->
    <DeleteConfirmModal
      v-if="editingDance"
      :show="showDeleteConfirm"
      :dance-title="editingDance.title"
      :loading="store.mutationLoading"
      @confirm="onConfirmDeleteFromEdit"
      @cancel="showDeleteConfirm = false"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDanceStore, isUsableCover, deriveStatus, extractYouTubeId } from '../stores/danceStore'
import CoverArtworkPicker from './dance/CoverArtworkPicker.vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'
import type { Dance } from '../services/danceService'

const props = defineProps<{
  show: boolean
  editingDance: Dance | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const store = useDanceStore()
const coverPickerRef = ref<InstanceType<typeof CoverArtworkPicker> | null>(null)

interface FormState {
  title: string
  artist: string
  category: string
  difficulty: string
  progress: number
  coverImage: string
  sourceLink: string
  uploadLink: string
  notes: string
  coverFile: File | null
}

const emptyForm = (): FormState => ({
  title: '',
  artist: '',
  category: 'K-Pop',
  difficulty: 'Medium',
  progress: 0,
  coverImage: '',
  sourceLink: '',
  uploadLink: '',
  notes: '',
  coverFile: null
})

const form = ref<FormState>(emptyForm())
const detailsOpen = ref(false)
const showDiscardConfirm = ref(false)
const showDeleteConfirm = ref(false)
const sourceLinkError = ref('')
const uploadLinkError = ref('')

watch(
  () => props.show,
  (val) => {
    showDiscardConfirm.value = false
    showDeleteConfirm.value = false
    sourceLinkError.value = ''
    uploadLinkError.value = ''
    if (val) {
      if (props.editingDance) {
        form.value = {
          title: props.editingDance.title || '',
          artist: props.editingDance.artist || '',
          category: props.editingDance.category || 'K-Pop',
          difficulty: props.editingDance.difficulty || 'Medium',
          progress: props.editingDance.progress || 0,
          coverImage: props.editingDance.coverImage || '',
          sourceLink: props.editingDance.sourceLink || '',
          uploadLink: props.editingDance.uploadLink || '',
          notes: props.editingDance.notes || '',
          coverFile: null
        }
        const hasDetails = Boolean(
          (props.editingDance.progress && props.editingDance.progress > 0) ||
          props.editingDance.sourceLink ||
          props.editingDance.uploadLink ||
          props.editingDance.notes
        )
        detailsOpen.value = hasDetails
      } else {
        form.value = emptyForm()
        detailsOpen.value = false
      }
      coverPickerRef.value?.resetState()
    }
  }
)

watch(
  () => form.value.sourceLink,
  (newLink) => {
    const ytId = extractYouTubeId(newLink || '')
    if (ytId && !form.value.coverFile && (!form.value.coverImage || form.value.coverImage.includes('img.youtube.com'))) {
      form.value.coverImage = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    }
  }
)

const computedStatus = computed(() => {
  const cleanProgress = Math.min(100, Math.max(0, Number(form.value.progress) || 0))
  return deriveStatus(cleanProgress, form.value.uploadLink)
})

const computedMilestone = computed(() => {
  if (computedStatus.value === 'Uploaded') return 'uploaded'
  const p = Number(form.value.progress) || 0
  if (p >= 75) return 'ready'
  if (p > 0) return 'learning'
  return 'want'
})

function setMilestone(milestone: 'want' | 'learning' | 'ready' | 'uploaded') {
  if (milestone === 'want') {
    form.value.progress = 0
  } else if (milestone === 'learning') {
    form.value.progress = form.value.progress > 0 && form.value.progress < 75 ? form.value.progress : 50
  } else if (milestone === 'ready') {
    form.value.progress = form.value.progress >= 75 ? form.value.progress : 80
  } else if (milestone === 'uploaded') {
    form.value.progress = 100
  }
}

const hasOptionalContent = computed(() => {
  return Boolean(
    (form.value.progress && form.value.progress > 0) ||
    form.value.sourceLink ||
    form.value.uploadLink ||
    form.value.notes
  )
})

function isFormDirty(): boolean {
  if (props.editingDance) {
    return (
      form.value.title !== props.editingDance.title ||
      form.value.artist !== props.editingDance.artist ||
      form.value.category !== props.editingDance.category ||
      form.value.difficulty !== props.editingDance.difficulty ||
      form.value.progress !== props.editingDance.progress ||
      form.value.coverImage !== (props.editingDance.coverImage || '') ||
      form.value.sourceLink !== (props.editingDance.sourceLink || '') ||
      form.value.uploadLink !== (props.editingDance.uploadLink || '') ||
      form.value.notes !== (props.editingDance.notes || '') ||
      Boolean(form.value.coverFile)
    )
  }
  return Boolean(
    form.value.title ||
    form.value.artist ||
    (form.value.coverImage && isUsableCover(form.value.coverImage)) ||
    form.value.sourceLink ||
    form.value.uploadLink ||
    form.value.notes ||
    form.value.progress ||
    form.value.coverFile
  )
}

function attemptClose() {
  if (isFormDirty()) {
    showDiscardConfirm.value = true
    return
  }
  forceClose()
}

function forceClose() {
  showDiscardConfirm.value = false
  showDeleteConfirm.value = false
  emit('close')
}

async function onConfirmDeleteFromEdit() {
  if (!props.editingDance) return
  const danceToDelete = props.editingDance
  showDeleteConfirm.value = false
  forceClose()
  await store.confirmDelete(danceToDelete)
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

function onNormalizeLinks() {
  if (form.value.sourceLink) {
    form.value.sourceLink = normalizeUrl(form.value.sourceLink)
  }
  if (form.value.uploadLink) {
    form.value.uploadLink = normalizeUrl(form.value.uploadLink)
  }
  sourceLinkError.value = validateOptionalUrl(form.value.sourceLink)
  uploadLinkError.value = validateOptionalUrl(form.value.uploadLink)
}

function validateOptionalUrl(url: string): string {
  if (!url) return ''
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return 'Use a web link beginning with http:// or https://.'
    }
    return ''
  } catch {
    return 'Enter a valid web link, or leave this field empty.'
  }
}

async function onSave() {
  onNormalizeLinks()
  if (sourceLinkError.value || uploadLinkError.value) {
    detailsOpen.value = true
    return
  }
  try {
    await store.saveDance(form.value, form.value.coverFile)
    emit('saved')
  } catch (error) {
    console.error('Save failed:', error)
  }
}
</script>

<style scoped>
.form-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 4px 0 12px;
  color: var(--text);
}

.form-section-heading span,
.optional-fields-hint {
  color: var(--muted);
  font-size: 12px;
}

.optional-fields-hint {
  margin: 0 0 16px;
}

.field-error {
  color: #ff7b72;
}
</style>
