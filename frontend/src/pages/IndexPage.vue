<template>
  <q-page class="danceplay-root">
    <!-- TOP NAVIGATION -->
    <AppHeader
      :active-view="activeView"
      @navigate="navigate"
      @open-add="store.openAddModal"
      @open-dev-test="showDevTest = true"
    />

    <main>
      <Transition name="view" mode="out-in">
        <!-- HOME VIEW -->
        <section v-if="activeView === 'home'" key="home" class="page home-page">
          <!-- Modular Hero Section -->
          <DashboardHero @navigate="navigate" />

          <!-- Stats Grid -->
          <section class="stats-grid">
            <div class="stat-card">
              <span class="stat-icon">✦</span>
              <div>
                <strong>
                  <span v-if="store.isInitialLoading" class="stat-value-skeleton"></span>
                  <template v-else>{{ store.totalDances }}</template>
                </strong>
                <span class="stat-label">Total Dances</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">◌</span>
              <div>
                <strong>
                  <span v-if="store.isInitialLoading" class="stat-value-skeleton"></span>
                  <template v-else>{{ store.learningCount }}</template>
                </strong>
                <span class="stat-label">Learning</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">◉</span>
              <div>
                <strong>
                  <span v-if="store.isInitialLoading" class="stat-value-skeleton"></span>
                  <template v-else>{{ store.readyCount }}</template>
                </strong>
                <span class="stat-label">Ready to Film</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">↗</span>
              <div>
                <strong>
                  <span v-if="store.isInitialLoading" class="stat-value-skeleton"></span>
                  <template v-else>{{ store.uploadedCount }}</template>
                </strong>
                <span class="stat-label">Uploaded</span>
              </div>
            </div>
          </section>

          <!-- Home Initial Loading Skeletons -->
          <section class="content-section" v-if="store.isInitialLoading" aria-label="Loading active routines">
            <div class="section-heading">
              <div>
                <span class="eyebrow">PREPARING</span>
                <h2>Active Routines</h2>
              </div>
            </div>
            <div class="dance-row">
              <div
                v-for="idx in 5"
                :key="`home-skel-${idx}`"
                class="dance-card dance-card-skeleton"
                style="flex: 0 0 230px;"
              >
                <div class="card-image-skeleton"></div>
                <div class="card-body-skeleton">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </section>

          <!-- Continue Learning Section -->
          <section class="content-section" v-if="!store.isInitialLoading && !store.loadError && store.learningDances.length">
            <div class="section-heading">
              <div>
                <span class="eyebrow">KEEP GOING</span>
                <h2>Continue Learning</h2>
              </div>
              <button class="text-btn" @click="setStatusFilter('Learning')">See all →</button>
            </div>
            <div class="dance-row">
              <DanceCard
                v-for="dance in store.learningDances.slice(0, 5)"
                :key="dance.id"
                :dance="dance"
                active-view="home"
                @open="store.openDance"
                @toggle-favorite="store.toggleFavorite"
              />
            </div>
          </section>

          <!-- Recently Added Section -->
          <section class="content-section" v-if="!store.isInitialLoading && !store.loadError && store.recentlyAddedDances.length">
            <div class="section-heading">
              <div>
                <span class="eyebrow">NEW IN COLLECTION</span>
                <h2>Recently Added</h2>
              </div>
              <button class="text-btn" @click="navigate('dances')">See all →</button>
            </div>
            <div class="dance-row">
              <DanceCard
                v-for="dance in store.recentlyAddedDances"
                :key="dance.id"
                :dance="dance"
                active-view="home"
                @open="store.openDance"
                @toggle-favorite="store.toggleFavorite"
              />
            </div>
          </section>

          <!-- Top in Rotation Section -->
          <section class="content-section" v-if="!store.isInitialLoading && !store.loadError && store.trendingDances.length">
            <div class="section-heading">
              <div>
                <span class="eyebrow">ACTIVE FOCUS</span>
                <h2>Top in Rotation</h2>
              </div>
              <button class="text-btn" @click="navigate('dances')">See all →</button>
            </div>
            <div class="dance-row">
              <DanceCard
                v-for="dance in store.trendingDances"
                :key="dance.id"
                :dance="dance"
                :is-trending="true"
                active-view="home"
                @open="store.openDance"
                @toggle-favorite="store.toggleFavorite"
              />
            </div>
          </section>

          <!-- Recently Uploaded Section -->
          <section class="content-section" v-if="!store.isInitialLoading && !store.loadError">
            <div class="section-heading">
              <div>
                <span class="eyebrow">YOUR CONTENT</span>
                <h2>Recently Uploaded</h2>
              </div>
              <button class="text-btn" v-if="store.uploadedDances.length" @click="setStatusFilter('Uploaded')">See all →</button>
            </div>
            <div class="dance-row" v-if="store.uploadedDances.length">
              <DanceCard
                v-for="dance in store.uploadedDances.slice(0, 5)"
                :key="dance.id"
                :dance="dance"
                :is-uploaded="true"
                active-view="home"
                @open="store.openDance"
                @toggle-favorite="store.toggleFavorite"
              />
            </div>
            <div class="empty-section-banner" v-else>
              <div class="empty-section-content">
                <span class="empty-section-icon">🎬</span>
                <div>
                  <strong>No uploaded routines yet</strong>
                  <p>Filmed your dance? Edit a routine and paste your TikTok, Instagram, or YouTube link to showcase your performances here.</p>
                </div>
              </div>
              <button class="secondary-btn" @click="setStatusFilter('Ready to Film')">
                View Ready to Film ({{ store.readyCount }}) →
              </button>
            </div>
          </section>

          <!-- ACTIVITY 2 BACKEND TEST SECTION (Home Page Bottom) -->
          <BackendTestSection />
        </section>

        <!-- MY DANCES / FAVORITES VIEW -->
        <section v-else key="listing" class="page listing-page">
          <div class="listing-header">
            <div>
              <span class="eyebrow">
                {{ activeView === 'favorites' ? 'SAVED FOR LATER' : 'YOUR COLLECTION' }}
              </span>
              <h1>{{ activeView === 'favorites' ? 'Favorites' : 'My Dances' }}</h1>
              <p v-if="activeView === 'favorites'">The dances you've marked for quick access.</p>
              <p v-else>Track every dance from your first practice to your upload.</p>
            </div>
            <button class="primary-btn" @click="store.openAddModal">+ Add Dance</button>
          </div>

          <!-- Modular Filter Toolbar -->
          <DanceFilterToolbar
            @status-selected="setStatusFilter"
          />

          <!-- Skeletons -->
          <div class="dance-grid dance-grid-skeleton" v-if="store.isInitialLoading" aria-label="Loading dances">
            <div v-for="index in 8" :key="`skeleton-${index}`" class="dance-card-skeleton">
              <div class="card-image-skeleton"></div>
              <div class="card-body-skeleton">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <!-- Load Error State -->
          <div class="empty-state load-error-state" v-else-if="store.loadError">
            <div class="empty-icon">!</div>
            <h2>Unable to load dances</h2>
            <p>{{ store.loadError }}</p>
            <small>Check your internet connection, then try again.</small>
            <button class="primary-btn" @click="store.fetchDances(1)">Retry</button>
          </div>

          <!-- Infinite Scroll Dance Grid -->
          <q-infinite-scroll
            v-else-if="displayedDances.length"
            ref="infiniteScrollRef"
            @load="onScrollLoad"
            :offset="250"
            :disable="store.currentPage >= store.lastPage"
          >
            <div class="dance-grid">
              <DanceCard
                v-for="dance in displayedDances"
                :key="dance.id"
                :dance="dance"
                :active-view="activeView"
                @open="store.openDance"
                @toggle-favorite="store.toggleFavorite"
              />
            </div>
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </template>
          </q-infinite-scroll>

          <!-- Empty State -->
          <div class="empty-state" v-else>
            <div class="empty-icon">✦</div>
            <h2 v-if="activeView === 'favorites'">No favorites yet</h2>
            <h2 v-else-if="store.searchQuery">No dances found</h2>
            <h2 v-else-if="store.statusFilter !== 'All' || store.categoryFilter !== 'All'">No dances match your filters</h2>
            <h2 v-else>No dances here yet</h2>
            <p v-if="store.searchQuery">No dances matched "{{ store.searchQuery }}". Try a different search term or clear filters.</p>
            <p v-else-if="activeView === 'favorites'">Tap the heart on any dance to save it for quick practice.</p>
            <p v-else-if="store.statusFilter !== 'All' || store.categoryFilter !== 'All'">Try resetting your filters or selecting a different category.</p>
            <p v-else>Add your first dance and start tracking your progress.</p>
            <div class="empty-state-actions" style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; justify-content: center;">
              <button
                v-if="hasActiveFilters"
                type="button"
                class="secondary-btn"
                @click="resetFilters"
              >
                ✕ Clear Filters & Search
              </button>
              <button
                v-if="activeView === 'dances' && !hasActiveFilters"
                type="button"
                class="primary-btn"
                @click="store.openAddModal"
              >
                + Add Dance
              </button>
            </div>
          </div>
        </section>
      </Transition>
    </main>

    <!-- TOAST NOTIFICATIONS (Modular Common Component) -->
    <ToastStack />

    <!-- DANCE DETAIL MODAL (Quasar Dialog) -->
    <DanceDetailModal
      :dance="store.selectedDance"
      @close="store.closeDance"
      @edit="store.openEditModal"
    />

    <!-- DANCE FORM MODAL (Quasar Dialog) -->
    <DanceFormModal
      :show="store.showForm"
      :editing-dance="store.editingDance"
      @close="store.closeForm"
    />

    <!-- FOOTER -->
    <footer>
      <span>© 2026 DancePlay</span>
      <span>Discover it. Learn it. Film it. Upload it.</span>
    </footer>

    <!-- MOBILE BOTTOM NAVIGATION (Fixed) -->
    <AppBottomNav
      :active-view="activeView"
      @navigate="navigate"
    />

    <!-- ACTIVITY 2 API DEMO COMPONENT (Opened via Profile menu) -->
    <ApiDemoCard v-model="showDevTest" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDanceStore } from '../stores/danceStore'

import AppHeader from '../components/AppHeader.vue'
import AppBottomNav from '../components/AppBottomNav.vue'
import DanceCard from '../components/DanceCard.vue'
import DanceDetailModal from '../components/DanceDetailModal.vue'
import DanceFormModal from '../components/DanceFormModal.vue'
import ApiDemoCard from '../components/ApiDemoCard.vue'
import DashboardHero from '../components/dance/DashboardHero.vue'
import DanceFilterToolbar from '../components/dance/DanceFilterToolbar.vue'
import ToastStack from '../components/common/ToastStack.vue'
import BackendTestSection from '../components/home/BackendTestSection.vue'

import type { QInfiniteScroll } from 'quasar'

const store = useDanceStore()
const route = useRoute()
const router = useRouter()

const activeView = ref('home')
const showDevTest = ref(false)
const infiniteScrollRef = ref<InstanceType<typeof QInfiniteScroll> | null>(null)

function statusSlug(filter: string): string {
  return filter.toLowerCase().replace(/\s+/g, '-')
}

function statusFromSlug(slug: unknown): string {
  const normalized = Array.isArray(slug) ? slug[0] : slug
  const match = store.filters.find((filter) => statusSlug(filter) === normalized)
  return match || 'All'
}

function updateActiveViewFromRoute() {
  const path = route.path
  if (path === '/discover') {
    void router.replace('/dances')
    activeView.value = 'dances'
    return
  }
  activeView.value = path.startsWith('/dances')
    ? 'dances'
    : path === '/favorites'
      ? 'favorites'
      : 'home'

  store.statusFilter = activeView.value === 'dances' ? statusFromSlug(route.query.status) : 'All'
}

const displayedDances = computed(() => {
  if (activeView.value === 'favorites') {
    return store.favoriteDances
  }
  return store.dances
})

function navigate(view: string) {
  activeView.value = view
  store.searchQuery = ''
  store.statusFilter = 'All'
  store.categoryFilter = 'All'
  void router.push(`/${view}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const hasActiveFilters = computed(() => {
  return Boolean(
    store.searchQuery.trim() ||
    store.statusFilter !== 'All' ||
    store.categoryFilter !== 'All'
  )
})

function resetFilters() {
  store.searchQuery = ''
  store.statusFilter = 'All'
  store.categoryFilter = 'All'
  if (activeView.value === 'dances') {
    void router.push('/dances')
  }
  void store.fetchDances(1, false)
}

function setStatusFilter(filter: string) {
  store.statusFilter = filter
  activeView.value = 'dances'
  void router.push({
    path: '/dances',
    query: filter === 'All' ? {} : { status: statusSlug(filter) }
  })
  void store.fetchDances(1, false)
}

async function onScrollLoad(index: number, done: (stop?: boolean) => void) {
  if (store.currentPage >= store.lastPage) {
    if (typeof done === 'function') done(true)
    return
  }
  const nextPage = store.currentPage + 1
  await store.fetchDances(nextPage, true)
  if (typeof done === 'function') {
    done(store.currentPage >= store.lastPage)
  }
}

onMounted(() => {
  updateActiveViewFromRoute()
  document.body.classList.add('app-ready')
  void store.fetchDances(1)
  void store.fetchStats()
  void store.fetchTrendingDances()
})

watch(
  () => route.path,
  () => {
    updateActiveViewFromRoute()
  }
)

watch(
  () => route.query.status,
  (status) => {
    if (activeView.value === 'dances') {
      store.statusFilter = statusFromSlug(status)
      void store.fetchDances(1, false)
    }
  }
)
</script>
