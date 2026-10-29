<template>
  <header class="topbar">
    <a class="brand" href="#" @click.prevent="onNavigate('home')">
      <q-avatar size="32px">
        <img src="/logo.svg" alt="DancePlay Logo" @error="handleLogoError">
      </q-avatar>
      <span>DANCE<span class="brand-accent">PLAY</span></span>
    </a>

    <nav class="nav">
      <button :class="{ active: activeView === 'home' }" @click="onNavigate('home')">Home</button>
      <button :class="{ active: activeView === 'dances' }" @click="onNavigate('dances')">My Dances</button>
      <button :class="{ active: activeView === 'favorites' }" @click="onNavigate('favorites')">Favorites</button>
    </nav>

    <div class="header-actions">
      <button
        class="icon-btn"
        type="button"
        title="Search Dances"
        aria-label="Search dances"
        @click="onNavigate('dances')"
      >
        ⌕
      </button>
      <button class="topbar-add-btn" @click="emit('openAdd')" title="Add New Dance">
        <q-icon name="add" size="18px" />
        <span class="add-text">Add Dance</span>
      </button>
      <button
        class="avatar"
        title="Profile Menu"
        type="button"
        aria-label="Profile and account menu"
        aria-haspopup="menu"
      >
        <span>D</span>
        <q-menu anchor="bottom right" self="top right" :offset="[0, 10]" class="profile-menu-panel">
          <div class="profile-menu-header">
            <div class="profile-menu-avatar">D</div>
            <div class="profile-menu-info">
              <strong>DancePlay Dancer</strong>
              <span>MLDV Group • IT Elective 4</span>
            </div>
          </div>

          <q-separator dark class="q-my-sm" />

          <div class="profile-menu-stats">
            <div class="profile-stat-item">
              <strong>{{ store.totalDances }}</strong>
              <small>Total</small>
            </div>
            <div class="profile-stat-item">
              <strong>{{ store.learningCount }}</strong>
              <small>Learning</small>
            </div>
            <div class="profile-stat-item">
              <strong>{{ store.uploadedCount }}</strong>
              <small>Uploaded</small>
            </div>
          </div>

          <q-separator dark class="q-my-sm" />

          <q-list dense class="profile-menu-links">
            <q-item clickable v-close-popup @click="onNavigate('dances')">
              <q-item-section side class="menu-icon-side">
                <q-icon name="folder" size="18px" color="primary" />
              </q-item-section>
              <q-item-section>My Collection</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="onNavigate('favorites')">
              <q-item-section side class="menu-icon-side">
                <q-icon name="favorite" size="18px" color="pink" />
              </q-item-section>
              <q-item-section>Favorites</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="emit('openAdd')">
              <q-item-section side class="menu-icon-side">
                <q-icon name="add_circle" size="18px" color="purple" />
              </q-item-section>
              <q-item-section>Add Dance</q-item-section>
            </q-item>
            <q-separator dark class="q-my-xs" />
            <q-item clickable v-close-popup @click="emit('openDevTest')">
              <q-item-section side class="menu-icon-side">
                <q-icon name="terminal" size="18px" color="teal" />
              </q-item-section>
              <q-item-section>Backend API Test</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDanceStore } from '../stores/danceStore'

defineProps<{
  activeView: string
}>()

const emit = defineEmits<{
  (e: 'navigate', view: string): void
  (e: 'openAdd'): void
  (e: 'openDevTest'): void
}>()

const store = useDanceStore()

function onNavigate(view: string) {
  emit('navigate', view)
}

function handleLogoError(event: Event) {
  const target = event.target as HTMLImageElement
  target.src = 'https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg'
}
</script>

<style scoped>
.topbar-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #8c62ff, #bb5ce9);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(148, 87, 255, 0.25);
  transition: filter 0.18s ease, transform 0.12s ease;
}
.topbar-add-btn:hover {
  filter: brightness(1.08);
}
.topbar-add-btn:active {
  transform: scale(0.96);
}
@media (max-width: 600px) {
  .topbar-add-btn {
    padding: 8px 10px;
  }
  .topbar-add-btn .add-text {
    display: none;
  }
}
</style>

<!-- Global styles for portalled Quasar menu -->
<style>
.profile-menu-panel {
  background: #14141e !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 16px !important;
  min-width: 250px !important;
  padding: 14px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6) !important;
  color: #f5f4fa !important;
}
.profile-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px;
}
.profile-menu-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8d58ff, #ec74be);
  font-weight: 700;
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(141, 88, 255, 0.35);
}
.profile-menu-info strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
.profile-menu-info span {
  font-size: 11px;
  color: #a4a2ae;
  display: block;
  margin-top: 2px;
}
.profile-menu-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  text-align: center;
  padding: 6px 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.profile-stat-item strong {
  display: block;
  font-size: 15px;
  color: #fff;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
}
.profile-stat-item small {
  font-size: 10px;
  color: #a4a2ae;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.profile-menu-links {
  color: #e0dcf0;
  font-size: 13px;
  padding: 0;
}
.profile-menu-links .q-item {
  border-radius: 8px;
  min-height: 38px;
  padding: 0 10px;
  margin: 2px 0;
  transition: background 0.15s ease, color 0.15s ease;
}
.profile-menu-links .q-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.menu-icon-side {
  padding-right: 10px !important;
  min-width: 28px !important;
}
</style>
