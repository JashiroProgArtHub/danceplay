<template>
  <TransitionGroup
    name="toast"
    tag="div"
    class="toast-stack"
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      v-for="toast in store.toasts"
      :key="toast.id"
      class="action-toast"
    >
      <span>{{ toast.message }}</span>
      <button
        v-if="toast.actionLabel"
        type="button"
        class="toast-action-btn"
        @click="toast.onAction && toast.onAction()"
      >
        {{ toast.actionLabel }}
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { useDanceStore } from '../../stores/danceStore'

const store = useDanceStore()
</script>
