<template>
  <!-- Loading Skeleton -->
  <section class="hero hero-loading" v-if="store.isInitialLoading">
    <div class="hero-skeleton" aria-label="Loading dashboard"></div>
  </section>

  <!-- Next Move Hero -->
  <section class="hero" v-else-if="store.nextDance">
    <div class="hero-content">
      <span class="eyebrow">YOUR NEXT MOVE</span>
      <h1>{{ store.nextDance.title }}</h1>
      <p class="hero-artist hero-artist-primary">{{ store.nextDance.artist }}</p>
      <p class="hero-artist hero-artist-meta">
        {{ store.nextDance.category }} · {{ store.nextDance.difficulty }} · {{ store.nextDance.status }} · {{ store.nextDance.progress }}%
      </p>
      <p v-if="store.nextDance.status === 'Ready to Film'" class="hero-copy">
        You're ready to film this dance.
      </p>
      <p v-else-if="store.nextDance.status === 'Learning'" class="hero-copy">
        Keep practicing — you're {{ store.nextDance.progress }}% through.
      </p>
      <p v-else class="hero-copy">Start learning something new.</p>

      <div class="hero-actions">
        <button class="primary-btn" @click="store.openDance(store.nextDance)">
          <span>▶</span> View Dance
        </button>
        <button
          v-if="store.nextDance.status === 'Ready to Film'"
          class="secondary-btn"
          @click="store.openEditModal(store.nextDance)"
        >
          + Add Upload
        </button>
        <button v-else class="secondary-btn" @click="emit('navigate', 'dances')">
          View My Dances
        </button>
      </div>
    </div>

    <div class="hero-art">
      <DanceCoverImage
        :dance="store.nextDance"
        :alt="store.nextDance.title"
        img-class="hero-cover"
      />
      <div class="hero-overlay"></div>
      <div
        class="hero-badge"
        :class="{
          'status-want': store.nextDance.status === 'Want to Learn',
          'status-learning': store.nextDance.status === 'Learning',
          'status-ready': store.nextDance.status === 'Ready to Film',
          'status-uploaded': store.nextDance.status === 'Uploaded'
        }"
      >
        {{ store.nextDance.status }}
      </div>
    </div>
  </section>

  <!-- Error State -->
  <section class="hero hero-error" v-else-if="store.loadError">
    <div class="hero-content">
      <span class="eyebrow">YOUR NEXT MOVE</span>
      <h1>Dashboard unavailable.</h1>
      <p class="hero-copy">{{ store.loadError }}</p>
      <div class="hero-actions">
        <button class="primary-btn" @click="store.fetchDances(1)">Retry</button>
      </div>
    </div>
  </section>

  <!-- Empty Dashboard State -->
  <section class="hero" v-else>
    <div class="hero-content">
      <span class="eyebrow">YOUR NEXT MOVE</span>
      <h1>Your dance list is empty.</h1>
      <p class="hero-copy">Find a dance and start your collection.</p>
      <div class="hero-actions">
        <button class="primary-btn" @click="store.openAddModal">+ Add New Dance</button>
        <button class="secondary-btn" @click="emit('navigate', 'dances')">View Collection</button>
      </div>
    </div>
    <div class="hero-art">
      <img class="hero-cover" :src="store.defaultCover" alt="DancePlay default cover">
      <div class="hero-overlay"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDanceStore } from '../../stores/danceStore'
import DanceCoverImage from '../common/DanceCoverImage.vue'

const emit = defineEmits<{
  (e: 'navigate', view: string): void
}>()

const store = useDanceStore()
</script>
