<template>
  <q-layout view="lHh Lpr lFf" class="danceplay-layout">
    <!-- Offline status notification banner -->
    <Transition name="view">
      <div v-if="!isOnline" class="offline-indicator-banner" role="status" aria-live="assertive">
        <span class="offline-banner-icon">⚡</span>
        <span>You are currently offline. Actions will sync once your connection is restored.</span>
      </div>
    </Transition>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

function updateOnlineStatus() {
  isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : true
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

