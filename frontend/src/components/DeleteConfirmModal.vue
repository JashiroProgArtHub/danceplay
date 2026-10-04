<template>
  <q-dialog
    :model-value="show"
    persistent
    transition-show="scale"
    transition-hide="scale"
    @escape-key="emit('cancel')"
  >
    <div
      class="custom-confirm-card"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div class="confirm-icon-wrapper">
        <span class="confirm-icon">🗑</span>
      </div>
      <span class="eyebrow" style="color: #ff7597;">CONFIRM DELETION</span>
      <h3 id="delete-dialog-title">Delete “{{ danceTitle }}”?</h3>
      <p id="delete-dialog-desc">
        Are you sure you want to remove this dance routine? You can immediately restore it from the notification undo action.
      </p>
      <div class="confirm-actions">
        <button
          type="button"
          class="secondary-btn"
          :disabled="loading"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="danger-btn"
          :disabled="loading"
          @click="emit('confirm')"
        >
          {{ loading ? 'Deleting…' : 'Yes, Delete' }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  danceTitle: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
