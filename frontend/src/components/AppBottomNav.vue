<template>
  <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
    <button
      type="button"
      class="nav-item"
      :class="{ active: activeView === 'home' }"
      @click="emit('navigate', 'home')"
    >
      <q-icon name="home" size="22px" />
      <span>Home</span>
    </button>

    <button
      type="button"
      class="nav-item"
      :class="{ active: activeView === 'dances' }"
      @click="emit('navigate', 'dances')"
    >
      <q-icon name="video_library" size="22px" />
      <span>Dances</span>
    </button>

    <button
      type="button"
      class="nav-item"
      :class="{ active: activeView === 'favorites' }"
      @click="emit('navigate', 'favorites')"
    >
      <q-icon name="favorite" size="22px" />
      <span>Favorites</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  activeView: string
}>()

const emit = defineEmits<{
  (e: 'navigate', view: string): void
}>()
</script>

<style scoped>
.mobile-bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(12, 12, 18, 0.94);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 100;
    padding: 0 16px;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.45);
  }

  .nav-item {
    background: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 500;
    padding: 6px 16px;
    border-radius: 10px;
    transition: color 0.18s ease, transform 0.12s ease;
    flex: 1;
    min-height: 48px;
  }

  .nav-item:active {
    transform: scale(0.94);
  }

  .nav-item.active {
    color: var(--accent);
    font-weight: 700;
  }

  .nav-item.active :deep(.q-icon) {
    color: var(--accent);
    filter: drop-shadow(0 0 6px rgba(184, 108, 255, 0.5));
  }
}
</style>
