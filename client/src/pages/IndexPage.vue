<template>
  <q-page class="danceplay-root">

    <header class="topbar">
      <button class="mobile-menu" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle navigation">☰</button>
      <a class="brand" href="#" @click.prevent="activeView = 'home'">
        <span class="brand-mark">✦</span>
        <span>DANCE<span class="brand-accent">PLAY</span></span>
      </a>

      <nav class="nav" :class="{ open: mobileMenuOpen }">
        <button :class="{ active: activeView === 'home' }" @click="navigate('home')">Home</button>
        <button :class="{ active: activeView === 'discover' }" @click="navigate('discover')">Discover</button>
        <button :class="{ active: activeView === 'dances' }" @click="navigate('dances')">My Dances</button>
        <button :class="{ active: activeView === 'favorites' }" @click="navigate('favorites')">Favorites</button>
      </nav>

      <div class="header-actions">
        <button class="icon-btn" @click="navigate('discover')" title="Search">⌕</button>
        <button class="avatar" title="Profile">D</button>
      </div>
    </header>

    <main>
      <Transition name="view" mode="out-in">
      <!-- HOME -->
      <section v-if="activeView === 'home'" key="home" class="page home-page">
        <section class="hero hero-loading" v-if="isInitialLoading">
          <div class="hero-skeleton" aria-label="Loading dashboard"></div>
        </section>

        <section class="hero" v-else-if="nextDance">
          <div class="hero-content">
            <span class="eyebrow">YOUR NEXT MOVE</span>
            <h1>{{ nextDance.title }}</h1>
            <p class="hero-artist hero-artist-primary">{{ nextDance.artist }}</p>
            <p class="hero-artist hero-artist-meta">{{ nextDance.category }} · {{ nextDance.difficulty }} · {{ nextDance.status }} · {{ nextDance.progress }}%</p>
            <p v-if="nextDance.status === 'Ready to Film'" class="hero-copy">You're ready to film this dance.</p>
            <p v-else-if="nextDance.status === 'Learning'" class="hero-copy">Keep practicing — you're {{ nextDance.progress }}% through.</p>
            <p v-else class="hero-copy">Start learning something new.</p>
            <div class="hero-actions">
              <button class="primary-btn" @click="openDance(nextDance)">
                <span>▶</span> View Dance
              </button>
              <button v-if="nextDance.status === 'Ready to Film'" class="secondary-btn" @click="openEditModal(nextDance)">
                + Add Upload
              </button>
              <button v-else class="secondary-btn" @click="navigate('dances')">
                View My Dances
              </button>
            </div>
          </div>
          <div class="hero-art">
            <img class="hero-cover" :src="coverForDance(nextDance)" :alt="nextDance.title" @error="handleImageError($event, nextDance)">
            <div class="hero-overlay"></div>
            <div class="hero-badge" :class="{ 'status-want': nextDance.status === 'Want to Learn', 'status-learning': nextDance.status === 'Learning', 'status-ready': nextDance.status === 'Ready to Film', 'status-uploaded': nextDance.status === 'Uploaded' }">{{ nextDance.status }}</div>
          </div>
        </section>

        <section class="hero hero-error" v-else-if="loadError">
          <div class="hero-content">
            <span class="eyebrow">YOUR NEXT MOVE</span>
            <h1>Dashboard unavailable.</h1>
            <p class="hero-copy">{{ loadError }}</p>
            <div class="hero-actions">
              <button class="primary-btn" @click="loadDances(1)">Retry</button>
            </div>
          </div>
        </section>

        <section class="hero" v-else>
          <div class="hero-content">
            <span class="eyebrow">YOUR NEXT MOVE</span>
            <h1>Your dance list is empty.</h1>
            <p class="hero-copy">Find a dance and start your collection.</p>
            <div class="hero-actions">
              <button class="primary-btn" @click="openAddModal">+ Add New Dance</button>
              <button class="secondary-btn" @click="navigate('discover')">Discover</button>
            </div>
          </div>
          <div class="hero-art">
            <img class="hero-cover" :src="defaultCover" alt="DancePlay default cover">
            <div class="hero-overlay"></div>
          </div>
        </section>

        <section class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">✦</span>
            <div><strong><span v-if="isInitialLoading" class="stat-value-skeleton"></span><template v-else>{{ totalDances }}</template></strong><span class="stat-label">Total Dances</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◌</span>
            <div><strong><span v-if="isInitialLoading" class="stat-value-skeleton"></span><template v-else>{{ learningCount }}</template></strong><span class="stat-label">Learning</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◉</span>
            <div><strong><span v-if="isInitialLoading" class="stat-value-skeleton"></span><template v-else>{{ readyCount }}</template></strong><span class="stat-label">Ready to Film</span></div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">↗</span>
            <div><strong><span v-if="isInitialLoading" class="stat-value-skeleton"></span><template v-else>{{ uploadedCount }}</template></strong><span class="stat-label">Uploaded</span></div>
          </div>
        </section>

        <!-- ACTIVITY 2 API DEMO -->
        <section class="content-section api-demo-section">
          <div class="section-heading">
            <div>
              <span class="eyebrow">LARAVEL CONNECTION</span>
              <h2>Backend Test</h2>
            </div>
          </div>
          <q-card flat bordered class="api-demo-card">
            <q-card-section>
              <div class="api-demo-copy">
                <div>
                  <strong>Vue 3 + Quasar → Axios → Laravel</strong>
                  <p>Test the Activity 2 backend connection.</p>
                </div>
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  class="api-test-btn"
                  :loading="backendLoading"
                  label="Test Backend"
                  @click="testApi"
                />
              </div>
              <div v-if="backendMessage" class="api-message">{{ backendMessage }}</div>
              <div v-else-if="backendError" class="api-error">{{ backendError }}</div>
              <div v-else class="api-hint">Click “Test Backend” to request <code>/api/hello</code> from Laravel.</div>
            </q-card-section>
          </q-card>
        </section>

        <section class="content-section" v-if="!isInitialLoading && !loadError && learningDances.length">
          <div class="section-heading">
            <div><span class="eyebrow">KEEP GOING</span><h2>Continue Learning</h2></div>
            <button class="text-btn" @click="setStatusFilter('Learning')">See all →</button>
          </div>
          <div class="dance-row">
            <article class="dance-card" v-for="dance in learningDances.slice(0, 5)" :key="dance.id" @click="openDance(dance)">
              <div class="card-image">
                <img :src="coverForDance(dance)" :alt="dance.title" @error="handleImageError($event, dance)">
                <span class="status-pill" :class="{ 'status-want': dance.status === 'Want to Learn', 'status-learning': dance.status === 'Learning', 'status-ready': dance.status === 'Ready to Film' }">{{ dance.status }}</span>
                <button v-if="isOwned(dance)" class="favorite-btn" :class="{ liked: isFavorite(dance), 'favorite-pulse': favoritePulseId === dance.id }" @click.stop="toggleFavorite(dance)">♥</button>
              </div>
              <div class="card-body">
                <h3>{{ dance.title }}</h3>
                <p>{{ dance.artist }}</p>
                <div class="progress-line"><span :style="{ width: dance.progress + '%' }"></span></div>
                <div class="card-meta"><span>{{ dance.progress }}% learned</span><span>{{ dance.difficulty }}</span></div>
              </div>
            </article>
          </div>
        </section>

        <section class="content-section">
          <div class="section-heading">
            <div><span class="eyebrow">DISCOVER</span><h2>Trending This Week</h2></div>
            <button class="text-btn" @click="navigate('discover')">Explore →</button>
          </div>
          <div class="dance-row">
            <article class="dance-card" v-for="dance in trendingDances" :key="dance.id" @click="openDance(dance)">
              <div class="card-image">
                <img :src="coverForDance(dance)" :alt="dance.title" @error="handleImageError($event, dance)">
                <span class="trend-badge">🔥 #{{ dance.rank }}</span>
                <button v-if="isOwned(dance)" class="favorite-btn" :class="{ liked: isFavorite(dance), 'favorite-pulse': favoritePulseId === dance.id }" @click.stop="toggleFavorite(dance)">♥</button>
              </div>
              <div class="card-body">
                <h3>{{ dance.title }}</h3>
                <p>{{ dance.artist }}</p>
                <div class="card-meta"><span>{{ dance.category }}</span><span>{{ dance.difficulty }}</span></div>
              </div>
            </article>
          </div>
        </section>

        <section class="content-section" v-if="!isInitialLoading && !loadError && uploadedDances.length">
          <div class="section-heading">
            <div><span class="eyebrow">YOUR CONTENT</span><h2>Recently Uploaded</h2></div>
            <button class="text-btn" @click="setStatusFilter('Uploaded')">See all →</button>
          </div>
          <div class="dance-row">
            <article class="dance-card" v-for="dance in uploadedDances.slice(0, 5)" :key="dance.id" @click="openDance(dance)">
              <div class="card-image">
                <img :src="coverForDance(dance)" :alt="dance.title" @error="handleImageError($event, dance)">
                <span class="uploaded-badge">✓ UPLOADED</span>
              </div>
              <div class="card-body">
                <h3>{{ dance.title }}</h3>
                <p>{{ dance.artist }}</p>
                <div class="card-meta"><span>{{ dance.category }}</span><a v-if="dance.uploadLink" :href="dance.uploadLink" target="_blank" rel="noopener noreferrer" @click.stop>View video ↗</a></div>
              </div>
            </article>
          </div>
        </section>
      </section>

      <!-- DISCOVER / MY DANCES / FAVORITES -->
      <section v-else key="listing" class="page listing-page">
        <div class="listing-header">
          <div>
            <span class="eyebrow">{{ activeView === 'discover' ? 'FIND YOUR NEXT MOVE' : activeView === 'favorites' ? 'SAVED FOR LATER' : 'YOUR COLLECTION' }}</span>
            <h1>{{ activeView === 'discover' ? 'Discover' : activeView === 'favorites' ? 'Favorites' : 'My Dances' }}</h1>
            <p v-if="activeView === 'discover'">Explore dances and add the ones you want to learn.</p>
            <p v-else-if="activeView === 'favorites'">The dances you've marked for quick access.</p>
            <p v-else>Track every dance from your first practice to your upload.</p>
          </div>
          <button v-if="activeView !== 'discover'" class="primary-btn" @click="openAddModal">+ Add Dance</button>
        </div>

        <div class="toolbar">
          <label class="search-box">
            <span>⌕</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search dances, artists, or categories..."
              @update:model-value="loadDances(1, false)"
              @input="loadDances(1, false)"
            >
          </label>
          <div class="filter-dropdowns">
            <select
              v-model="categoryFilter"
              class="filter-dropdown"
              aria-label="Filter by category"
              @update:model-value="loadDances(1, false)"
              @change="loadDances(1, false)"
            >
              <option value="All">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <select
              v-if="activeView !== 'discover'"
              v-model="statusFilter"
              class="filter-dropdown status-select"
              aria-label="Filter by status"
              @update:model-value="loadDances(1, false)"
              @change="loadDances(1, false)"
            >
              <option value="All">All Statuses</option>
              <option v-for="filter in filters.filter(f => f !== 'All')" :key="filter" :value="filter">{{ filter }}</option>
            </select>
          </div>
          <div v-if="activeView !== 'discover'" class="filters">
            <button v-for="filter in filters" :key="filter" :class="{ selected: statusFilter === filter }" @click="setStatusFilter(filter)">{{ filter }}</button>
          </div>
        </div>

        <div class="dance-grid dance-grid-skeleton" v-if="isInitialLoading" aria-label="Loading dances">
          <div v-for="index in skeletonCards" :key="`skeleton-${index}`" class="dance-card-skeleton">
            <div class="card-image-skeleton"></div>
            <div class="card-body-skeleton">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <div class="empty-state load-error-state" v-else-if="loadError">
          <div class="empty-icon">!</div>
          <h2>Unable to load dances</h2>
          <p>{{ loadError }}</p>
          <button class="primary-btn" @click="loadDances(1)">Retry</button>
        </div>

        <q-infinite-scroll
          v-else-if="dances.length"
          ref="infiniteScroll"
          @load="onLoad"
          :offset="250"
          :disable="currentPage >= lastPage"
        >
          <div class="dance-grid">
            <article class="dance-card" v-for="dance in dances" :key="dance.id" @click="openDance(dance)">
              <div class="card-image">
                <img :src="coverForDance(dance)" :alt="dance.title" @error="handleImageError($event, dance)">
                <span v-if="activeView === 'discover' && isOwned(dance)" class="status-pill status-owned">IN MY DANCES</span>
                <span v-else-if="dance.status === 'Want to Learn'" class="status-pill status-want">WANT TO LEARN</span>
                <span v-else-if="dance.status === 'Learning'" class="status-pill status-learning">LEARNING</span>
                <span v-else-if="dance.status === 'Ready to Film'" class="status-pill status-ready">READY TO FILM</span>
                <span v-else class="uploaded-badge">✓ UPLOADED</span>
                <button v-if="activeView !== 'discover' || isOwned(dance)" class="favorite-btn" :class="{ liked: isFavorite(dance), 'favorite-pulse': favoritePulseId === dance.id }" @click.stop="toggleFavorite(dance)">♥</button>
              </div>
              <div class="card-body">
                <div class="card-title-row"><h3>{{ dance.title }}</h3><span class="category-dot"></span></div>
                <p>{{ dance.artist }}</p>
                <div class="progress-line" v-if="activeView !== 'discover' && dance.status !== 'Uploaded'"><span :style="{ width: dance.progress + '%' }"></span></div>
                <div class="card-meta">
                  <span v-if="activeView === 'discover'">{{ isOwned(dance) ? 'In My Dances' : 'Discover dance' }}</span>
                  <span v-else>{{ dance.status === 'Uploaded' ? 'Uploaded' : dance.progress + '% learned' }}</span>
                  <span>{{ dance.category }}</span>
                </div>
                <button v-if="activeView === 'discover' && !isOwned(dance)" class="secondary-btn" @click.stop="addToMyDances(dance)">Add to My Dances</button>
                <button v-else-if="activeView === 'discover'" class="secondary-btn" @click.stop="openDance(dance)">View My Dance</button>
              </div>
            </article>
          </div>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>

        <div class="empty-state" v-else>
          <div class="empty-icon">✦</div>
          <h2 v-if="activeView === 'discover'">No discoverable dances found</h2>
          <h2 v-else-if="activeView === 'favorites'">No favorites yet</h2>
          <h2 v-else-if="searchQuery">No dances found</h2>
          <h2 v-else-if="statusFilter !== 'All'">No dances match this filter</h2>
          <h2 v-else>No dances here yet</h2>
          <p v-if="activeView === 'discover'">Try a different search term.</p>
          <p v-else-if="searchQuery">Try a different search term.</p>
          <p v-else-if="activeView === 'favorites'">Tap the heart on a dance to save it here.</p>
          <p v-else-if="statusFilter !== 'All'">Choose another status filter to see more dances.</p>
          <p v-else>Add your first dance and start tracking your progress.</p>
          <button v-if="activeView === 'dances' && !searchQuery && statusFilter === 'All'" class="primary-btn" @click="openAddModal">+ Add Dance</button>
        </div>
      </section>
      </Transition>
    </main>

    <TransitionGroup name="toast" tag="div" class="toast-stack" aria-live="polite" aria-atomic="true">
      <div v-for="toast in toasts" :key="toast.id" class="action-toast">{{ toast.message }}</div>
    </TransitionGroup>

    <!-- DANCE DETAIL MODAL -->
    <div class="modal-backdrop" v-if="selectedDance" @click.self="closeDance">
      <div class="detail-modal">
        <button class="close-btn" @click="closeDance">×</button>
        <div class="detail-cover">
          <img :src="coverForDance(selectedDance)" :alt="selectedDance.title" @error="handleImageError($event, selectedDance)">
        </div>
        <div class="detail-content">
          <div class="detail-heading">
            <div>
              <span class="eyebrow">{{ selectedDance.category }} · {{ selectedDance.difficulty }}</span>
              <h2>{{ selectedDance.title }}</h2>
              <p>{{ selectedDance.artist }}</p>
            </div>
            <button v-if="selectedDanceIsOwned" class="favorite-large" :class="{ liked: selectedDance.favorite, 'favorite-pulse': favoritePulseId === selectedDance.id }" @click="toggleFavorite(selectedDance)">♥</button>
          </div>

          <div class="detail-status" :class="{ 'status-want': selectedDance.status === 'Want to Learn', 'status-learning': selectedDance.status === 'Learning', 'status-ready': selectedDance.status === 'Ready to Film', 'status-uploaded': selectedDance.status === 'Uploaded' }">
            <span v-if="!selectedDanceIsOwned">DISCOVER DANCE</span>
            <span v-else-if="selectedDance.status === 'Want to Learn'">💭 WANT TO LEARN</span>
            <span v-else-if="selectedDance.status === 'Learning'">◌ LEARNING</span>
            <span v-else-if="selectedDance.status === 'Ready to Film'">🎥 READY TO FILM</span>
            <span v-else>✓ UPLOADED</span>
          </div>

          <div class="detail-progress" v-if="selectedDanceIsOwned">
            <div class="detail-progress-header"><strong>Learning Progress</strong><span>{{ selectedDance.progress }}%</span></div>
            <input
              class="progress-scrubber"
              type="range"
              min="0"
              max="100"
              step="1"
              :value="selectedDance.progress"
              :style="{ background: `linear-gradient(90deg, #9333ea 0%, #c084fc ${selectedDance.progress}%, rgba(255, 255, 255, 0.1) ${selectedDance.progress}%, rgba(255, 255, 255, 0.1) 100%)` }"
              aria-label="Learning progress"
              @input="previewProgress(selectedDance, $event)"
              @change="commitProgress(selectedDance)"
            >
            <div class="progress-actions">
              <button @click="updateProgress(selectedDance, -10)">−10%</button>
              <button @click="updateProgress(selectedDance, 10)">+10%</button>
              <button @click="setProgress(selectedDance, 100)">100%</button>
            </div>
          </div>

          <div class="detail-links">
            <a v-if="selectedDance.sourceLink" :href="selectedDance.sourceLink" target="_blank" class="secondary-btn" rel="noopener noreferrer">▶ Watch Original</a>
            <a v-if="selectedDance.uploadLink" :href="selectedDance.uploadLink" target="_blank" class="secondary-btn" rel="noopener noreferrer">↗ View My Upload</a>
          </div>

          <div class="notes" v-if="selectedDance.notes">
            <span class="eyebrow">NOTES</span>
            <p>{{ selectedDance.notes }}</p>
          </div>

          <div class="detail-actions">
            <button v-if="selectedDanceIsOwned" class="secondary-btn" @click="openEditModal(selectedDance)">Edit Dance</button>
            <button v-if="selectedDanceIsOwned" class="danger-btn" @click="requestDelete(selectedDance)">Delete</button>
            <button v-else class="primary-btn" @click="addToMyDances(selectedDance)">Add to My Dances</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
    <div class="modal-backdrop" v-if="showForm" @click.self="attemptCloseForm">
      <form class="form-modal" @submit.prevent="saveDance">
        <button type="button" class="close-btn" @click="attemptCloseForm">×</button>
        <span class="eyebrow">{{ editingDance ? 'UPDATE YOUR COLLECTION' : 'ADD TO YOUR COLLECTION' }}</span>
        <h2>{{ editingDance ? 'Edit Dance' : 'Add a Dance' }}</h2>
        <p class="form-intro">Save a dance you want to learn, practice, film, or upload.</p>

        <div class="form-grid">
          <label>Dance Name *<input v-model.trim="form.title" required placeholder="e.g. Magnetic"></label>
          <label>Artist / Creator *<input v-model.trim="form.artist" required placeholder="e.g. ILLIT"></label>
          <label>Category
            <select v-model="form.category">
              <option>K-Pop</option><option>TikTok</option><option>Dance Cover</option><option>Hip-Hop</option><option>Choreography</option><option>Freestyle</option><option>Other</option>
            </select>
          </label>
          <label>Difficulty
            <select v-model="form.difficulty"><option>Easy</option><option>Medium</option><option>Hard</option></select>
          </label>
          <label>Status
            <span class="form-status" :class="{ 'status-want': formStatus === 'Want to Learn', 'status-learning': formStatus === 'Learning', 'status-ready': formStatus === 'Ready to Film', 'status-uploaded': formStatus === 'Uploaded' }">{{ formStatus }} <small>Computed from progress and upload link</small></span>
          </label>
          <label>Progress (0–100)<input v-model.number="form.progress" type="number" min="0" max="100"></label>
          <label class="full">Cover Image URL
            <input v-model.trim="form.coverImage" type="url" placeholder="https://example.com/dance-cover.jpg">
            <input type="file" accept="image/*" @change="selectCoverImage">
            <small>Choose a local image or leave empty to use the DancePlay default cover.</small>
          </label>
          <label class="full">Original Dance / Tutorial Link
            <input v-model.trim="form.sourceLink" type="url" placeholder="https://www.youtube.com/...">
          </label>
          <label class="full">My Upload Link
            <input v-model.trim="form.uploadLink" type="url" placeholder="https://www.tiktok.com/...">
          </label>
          <label class="full">Notes
            <textarea v-model.trim="form.notes" rows="3" placeholder="What do you need to practice?"></textarea>
          </label>
        </div>

        <div class="form-preview">
          <span>Cover Preview</span>
          <img :src="form.coverImage && isUsableCover(form.coverImage) ? form.coverImage : defaultCover" alt="Cover preview" @error="handleImageError">
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-btn" @click="attemptCloseForm">Cancel</button>
          <button type="submit" class="primary-btn" :disabled="mutationLoading">{{ mutationLoading ? 'Saving…' : (editingDance ? 'Save Changes' : 'Add Dance') }}</button>
        </div>
      </form>
    </div>

    <div class="modal-backdrop" v-if="deleteTarget" @click.self="cancelDelete">
      <section class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <span class="eyebrow">IRREVERSIBLE ACTION</span>
        <h2 id="delete-title">Delete Dance?</h2>
        <p>This will permanently remove “{{ deleteTarget.title }}” from your collection.</p>
        <div class="form-actions">
          <button type="button" class="secondary-btn" @click="cancelDelete">Keep Dance</button>
          <button type="button" class="danger-btn" :disabled="mutationLoading" @click="confirmDelete">{{ mutationLoading ? 'Deleting…' : 'Delete Dance' }}</button>
        </div>
      </section>
    </div>

    <footer>
      <span>© 2026 DancePlay</span>
      <span>Discover it. Learn it. Film it. Upload it.</span>
    </footer>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import router from '../router'
import { createDance as createDanceApi, deleteDance as deleteDanceApi, getDances, updateDance as updateDanceApi, type Dance } from '../services/danceService'

interface FormState {
  title: string
  artist: string
  category: string
  difficulty: string
  progress: number
  coverImage?: string | undefined
  sourceLink?: string | undefined
  uploadLink?: string | undefined
  favorite: boolean
  notes?: string | undefined
  coverFile?: File | null | undefined
}

interface Toast {
  id: number
  message: string
  timerId?: number
}

const DEFAULT_COVERS = Array.from({ length: 9 }, (_, index) => `/default-cover-${index + 1}.svg`)

const DEFAULT_DANCES: Dance[] = [
  { id: 1, title: 'Magnetic', artist: 'ILLIT', category: 'K-Pop', difficulty: 'Medium', status: 'Learning', progress: 65, favorite: true, coverImage: '/illit.jpg', sourceLink: 'https://www.youtube.com/results?search_query=ILLIT+Magnetic+dance+tutorial', uploadLink: '', notes: 'Practice the second chorus and clean up the hand movements.' },
  { id: 2, title: 'Espresso', artist: 'Sabrina Carpenter', category: 'TikTok', difficulty: 'Medium', status: 'Learning', progress: 40, favorite: false, coverImage: '/sabrinacarpenter.jpg', sourceLink: 'https://www.youtube.com/results?search_query=Espresso+dance+tutorial', uploadLink: '', notes: 'Work on timing and transitions.' },
  { id: 3, title: 'Supernova', artist: 'aespa', category: 'K-Pop', difficulty: 'Hard', status: 'Ready to Film', progress: 90, favorite: true, coverImage: '/aespa.jpg', sourceLink: 'https://www.youtube.com/results?search_query=aespa+Supernova+dance+tutorial', uploadLink: '', notes: 'Film a full take after one more practice.' },
  { id: 4, title: 'Drama', artist: 'aespa', category: 'K-Pop', difficulty: 'Hard', status: 'Learning', progress: 30, favorite: false, coverImage: '/aespadrama.jpg', sourceLink: 'https://www.youtube.com/results?search_query=aespa+Drama+dance+tutorial', uploadLink: '', notes: 'Still learning the chorus.' },
  { id: 5, title: 'Smart', artist: 'LE SSERAFIM', category: 'K-Pop', difficulty: 'Medium', status: 'Want to Learn', progress: 0, favorite: false, coverImage: '/lesserafim.jpg', sourceLink: 'https://www.youtube.com/results?search_query=LE+SSERAFIM+Smart+dance+tutorial', uploadLink: '', notes: '' },
  { id: 6, title: 'Like JENNIE', artist: 'JENNIE', category: 'Dance Cover', difficulty: 'Medium', status: 'Uploaded', progress: 100, favorite: true, coverImage: '/likejennie.jpg', sourceLink: 'https://www.youtube.com/results?search_query=Like+JENNIE+dance+tutorial', uploadLink: 'https://www.youtube.com/', notes: 'Uploaded my first full cover.' },
  { id: 7, title: 'Touch', artist: 'KATSEYE', category: 'TikTok', difficulty: 'Easy', status: 'Uploaded', progress: 100, favorite: false, coverImage: '/katseye.jpg', sourceLink: 'https://www.youtube.com/results?search_query=KATSEYE+Touch+dance+tutorial', uploadLink: 'https://www.youtube.com/', notes: 'Short-form version uploaded.' },
  { id: 8, title: 'How Sweet', artist: 'NewJeans', category: 'K-Pop', difficulty: 'Medium', status: 'Want to Learn', progress: 0, favorite: false, coverImage: '/newjeans.jpg', sourceLink: 'https://www.youtube.com/results?search_query=NewJeans+How+Sweet+dance+tutorial', uploadLink: '', notes: '' }
]

const createEmptyForm = (): FormState => ({
  title: '', artist: '', category: 'K-Pop', difficulty: 'Medium', progress: 0, coverImage: '', sourceLink: '', uploadLink: '',   favorite: false, notes: '', coverFile: null
})

export default defineComponent({
  name: 'IndexPage',

  data() {
    return {
      activeView: 'home',
      mobileMenuOpen: false,
      dances: [] as Dance[],
      isInitialLoading: true,
      loadError: '',
      skeletonCards: 8,
      trendingDances: [
        { id: 't1', title: 'Magnetic', artist: 'ILLIT', category: 'K-Pop', difficulty: 'Medium', rank: 1, coverImage: '' },
        { id: 't2', title: 'Espresso', artist: 'Sabrina Carpenter', category: 'TikTok', difficulty: 'Medium', rank: 2, coverImage: '' },
        { id: 't3', title: 'Supernova', artist: 'aespa', category: 'K-Pop', difficulty: 'Hard', rank: 3, coverImage: '' },
        { id: 't4', title: 'Like JENNIE', artist: 'JENNIE', category: 'Dance Cover', difficulty: 'Medium', rank: 4, coverImage: '' },
        { id: 't5', title: 'Touch', artist: 'KATSEYE', category: 'TikTok', difficulty: 'Easy', rank: 5, coverImage: '' }
      ] as Dance[],
      currentPage: 1,
      lastPage: 1,
      searchQuery: '',
      search: '',
      categoryFilter: 'All',
      category: 'All',
      statusFilter: 'All',
      status: 'All',
      categories: ['K-Pop', 'TikTok', 'Dance Cover', 'Hip-Hop', 'Choreography', 'Freestyle', 'Other'],
      filters: ['All', 'Want to Learn', 'Learning', 'Ready to Film', 'Uploaded'],
      showForm: false,
      editingDance: null as Dance | null,
      selectedDance: null as Dance | null,
      deleteTarget: null as Dance | null,
      mutationLoading: false,
      favoritePulseId: null as number | string | null,
      defaultCover: (DEFAULT_COVERS[0] ?? '/default-cover-1.svg') as string,
      form: createEmptyForm(),
      backendMessage: '',
      backendError: '',
      backendLoading: false,
      toasts: [] as Toast[],
      nextToastId: 1
    }
  },

  computed: {
    totalDances(): number { return this.dances.length },
    learningCount(): number { return this.dances.filter(d => d.status === 'Learning').length },
    readyCount(): number { return this.dances.filter(d => d.status === 'Ready to Film').length },
    uploadedCount(): number { return this.dances.filter(d => d.status === 'Uploaded').length },
    learningDances(): Dance[] { return this.dances.filter(d => d.status === 'Learning') },
    uploadedDances(): Dance[] { return this.dances.filter(d => d.status === 'Uploaded') },
    discoverableDances(): Dance[] {
      return this.dances
    },
    selectedDanceIsOwned(): boolean {
      return Boolean(this.selectedDance && this.dances.some(d => d.id === this.selectedDance!.id))
    },
    nextDance(): Dance | null {
      const statuses = ['Ready to Film', 'Learning', 'Want to Learn']
      for (const status of statuses) {
        const candidates = this.dances.filter(d => d.status === status)
        if (candidates.length) {
          return candidates.reduce((highest, dance) => Number(dance.progress) > Number(highest.progress) ? dance : highest)
        }
      }
      return null
    },
    formStatus(): string {
      return this.deriveStatus(this.form.progress, this.form.uploadLink)
    },
    favoriteDances(): Dance[] { return this.dances.filter(d => d.favorite) },
    filteredDances(): Dance[] {
      return this.dances
    }
  },

  methods: {
    emptyForm(): FormState { return createEmptyForm() },
    handleKeydown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (this.deleteTarget) this.cancelDelete()
      else if (this.showForm) this.attemptCloseForm()
      else if (this.selectedDance) this.closeDance()
    },
    navigate(view: string) {
      this.activeView = view
      this.searchQuery = ''
      this.statusFilter = 'All'
      this.mobileMenuOpen = false
      void router.push(`/${view}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    setStatusFilter(filter: string) {
      this.statusFilter = filter
      this.status = filter
      this.activeView = 'dances'
      this.mobileMenuOpen = false
      void router.push({
        path: '/dances',
        query: filter === 'All' ? {} : { status: this.statusSlug(filter) }
      })
      this.loadDances(1, false)
    },
    statusSlug(filter: string): string {
      return filter.toLowerCase().replace(/\s+/g, '-')
    },
    statusFromSlug(slug: unknown): string {
      const normalized = Array.isArray(slug) ? slug[0] : slug
      const match = this.filters.find(filter => this.statusSlug(filter) === normalized)
      return match || 'All'
    },
    showToast(message: string) {
      const existing = this.toasts.find(toast => toast.message === message)
      if (existing) {
        if (existing.timerId !== undefined) window.clearTimeout(existing.timerId)
        existing.timerId = window.setTimeout(() => this.dismissToast(existing.id), 3000)
        return
      }

      const toast: Toast = { id: this.nextToastId++, message }
      toast.timerId = window.setTimeout(() => this.dismissToast(toast.id), 3000)
      const nextToasts = [...this.toasts, toast]
      nextToasts.slice(0, -2).forEach(item => {
        if (item.timerId !== undefined) window.clearTimeout(item.timerId)
      })
      this.toasts = nextToasts.slice(-2)
    },
    dismissToast(id: number) {
      const toast = this.toasts.find(item => item.id === id)
      if (toast?.timerId !== undefined) window.clearTimeout(toast.timerId)
      this.toasts = this.toasts.filter(item => item.id !== id)
    },
    openAddModal() {
      this.editingDance = null
      this.form = createEmptyForm()
      this.showForm = true
      this.selectedDance = null
    },
    openEditModal(dance: Dance) {
      const owned = this.findOwnedDance(dance)
      if (!owned) return
      this.editingDance = owned
      this.form = { ...owned, coverFile: null }
      this.showForm = true
      this.selectedDance = null
    },
    isFormDirty(): boolean {
      if (!this.showForm) return false
      if (this.editingDance) {
        return JSON.stringify({ ...this.form, coverFile: null }) !== JSON.stringify({ ...this.editingDance, coverFile: null })
      }
      return Boolean(this.form.title || this.form.artist || this.form.coverImage || this.form.sourceLink || this.form.uploadLink || this.form.notes || this.form.progress)
    },
    attemptCloseForm() {
      if (this.isFormDirty() && !window.confirm('Discard your unsaved dance changes?')) return
      this.closeForm()
    },
    closeForm() {
      this.showForm = false
      this.editingDance = null
      this.form = createEmptyForm()
    },
    async saveDance() {
      this.mutationLoading = true
      const hasUploadLink = Boolean(this.form.uploadLink && this.form.uploadLink.trim())
      const cleanProgress = Math.min(100, Math.max(0, Number(this.form.progress) || 0))
      const coverImageChanged = !this.editingDance || this.form.coverImage !== this.editingDance.coverImage
      const data: any = {
        ...this.form,
        status: this.deriveStatus(cleanProgress, this.form.uploadLink || ''),
        progress: hasUploadLink ? 100 : cleanProgress,
        favorite: this.editingDance ? this.editingDance.favorite : false
      }
      if (coverImageChanged && this.form.coverImage) {
        data.coverImage = this.form.coverImage
      } else if (!coverImageChanged) {
        delete data.coverImage
      }
      try {
        const saved = this.editingDance
          ? await updateDanceApi(Number(this.editingDance.id), data)
          : await createDanceApi(data)
        if (this.editingDance) {
          const index = this.dances.findIndex(d => d.id === this.editingDance!.id)
          if (index !== -1) this.dances[index] = this.normalizeDance(saved)
        } else this.dances.unshift(this.normalizeDance(saved))
        this.showToast(this.editingDance ? 'Changes saved' : 'Dance added to collection')
        this.closeForm()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save dance. Please check your connection.',
          position: 'top'
        })
        console.error('Save failed:', error)
      } finally {
        this.mutationLoading = false
      }
    },
    async addToMyDances(dance: Dance) {
      const existing = this.findOwnedDance(dance)
      if (existing) { this.selectedDance = existing; return existing }
      try {
        const saved = await createDanceApi({ title: dance.title, artist: dance.artist, category: dance.category, difficulty: dance.difficulty, status: 'Want to Learn', progress: 0, favorite: false, sourceLink: dance.sourceLink, notes: dance.notes })
        if (dance.coverImage) saved.coverImage = dance.coverImage
        this.dances.unshift(saved)
        this.selectedDance = saved
        this.showToast('Dance added to collection')
        return saved
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to add dance to collection. Please check your connection.',
          position: 'top'
        })
        console.error('Add to my dances failed:', error)
      }
    },
    requestDelete(dance: Dance) {
      this.deleteTarget = dance
    },
    cancelDelete() {
      if (!this.mutationLoading) this.deleteTarget = null
    },
    async confirmDelete() {
      if (!this.deleteTarget) return
      this.mutationLoading = true
      const dance = this.deleteTarget
      try {
        await deleteDanceApi(Number(dance.id))
        this.dances = this.dances.filter(d => d.id !== dance.id)
        if (this.selectedDance && this.selectedDance.id === dance.id) this.selectedDance = null
        this.deleteTarget = null
        this.showToast('Dance permanently removed')
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to delete dance. Please check your connection.',
          position: 'top'
        })
        console.error('Delete failed:', error)
      } finally {
        this.mutationLoading = false
      }
    },
    async toggleFavorite(dance: Dance) {
      const owned = this.findOwnedDance(dance)
      if (!owned) return
      owned.favorite = !owned.favorite
      this.favoritePulseId = owned.id
      window.setTimeout(() => {
        if (this.favoritePulseId === owned.id) this.favoritePulseId = null
      }, 220)
      try {
        await updateDanceApi(Number(owned.id), { favorite: owned.favorite })
        this.showToast(owned.favorite ? 'Added to favorites' : 'Removed from favorites')
      } catch (error) {
        owned.favorite = !owned.favorite
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update favorite status. Please check your connection.',
          position: 'top'
        })
        console.error('Toggle favorite failed:', error)
      }
    },
    async updateProgress(dance: Dance, amount: number) {
      dance.progress = Math.min(100, Math.max(0, dance.progress + amount))
      this.syncStatusAfterProgress(dance)
      await updateDanceApi(Number(dance.id), { progress: dance.progress, status: dance.status, uploadLink: dance.uploadLink })
    },
    async setProgress(dance: Dance, amount: number) {
      dance.progress = Math.min(100, Math.max(0, amount))
      this.syncStatusAfterProgress(dance)
      await updateDanceApi(Number(dance.id), { progress: dance.progress, status: dance.status, uploadLink: dance.uploadLink })
    },
    previewProgress(dance: Dance, event: Event) {
      const value = Number((event.target as HTMLInputElement).value)
      dance.progress = Math.min(100, Math.max(0, value))
      this.syncStatusAfterProgress(dance)
    },
    async commitProgress(dance: Dance) {
      await updateDanceApi(Number(dance.id), { progress: dance.progress, status: dance.status, uploadLink: dance.uploadLink })
    },
    syncStatusAfterProgress(dance: Dance) {
      const hasUploadLink = typeof dance.uploadLink === 'string' && dance.uploadLink.trim()
      if (hasUploadLink) dance.progress = 100
      dance.status = this.deriveStatus(dance.progress, dance.uploadLink)
    },
    deriveStatus(progress: number, uploadLink?: string): string {
      if (typeof uploadLink === 'string' && uploadLink.trim()) return 'Uploaded'
      if (progress >= 75) return 'Ready to Film'
      if (progress > 0) return 'Learning'
      return 'Want to Learn'
    },
    openDance(dance: Dance) {
      const actual = this.findOwnedDance(dance) || dance
      this.selectedDance = actual
    },
    findOwnedDance(dance: Dance): Dance | undefined {
      return this.dances.find(item => item.id === dance.id || (item.title === dance.title && item.artist === dance.artist))
    },
    isOwned(dance: Dance): boolean { return Boolean(this.findOwnedDance(dance)) },
    isFavorite(dance: Dance): boolean {
      const owned = this.findOwnedDance(dance)
      return Boolean(owned && owned.favorite)
    },
    closeDance() { this.selectedDance = null },
    coverForDance(dance: any): string {
      const cover = dance.coverImage || dance.cover_image
      if (cover && this.isUsableCover(cover)) return cover
      const key = String(dance.id || `${dance.title}:${dance.artist}`)
      let hash = 0
      for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0
      return DEFAULT_COVERS[hash % DEFAULT_COVERS.length] ?? '/default-cover-1.svg'
    },
    isUsableCover(cover: string): boolean {
      if (cover.startsWith('/')) return true
      if (cover.startsWith('blob:') || cover.startsWith('data:image/')) return true
      try {
        const url = new URL(cover)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    },
    handleImageError(e: Event, dance?: any) {
      const target = e.target as HTMLImageElement
      const fallback = (dance ? this.coverForDance({ ...dance, cover_image: '' }) : this.defaultCover) ?? '/default-cover.jpg'
      if (target.src.endsWith(fallback)) return
      target.src = fallback
    },
    async loadDances(page = 1, append = false) {
      if (!append) {
        this.isInitialLoading = true
      }
      this.loadError = ''
      try {
        const searchVal = (this.search || this.searchQuery || '').trim()
        const categoryVal = this.category !== 'All' && this.category ? this.category : (this.categoryFilter !== 'All' ? this.categoryFilter : '')
        const statusVal = this.status !== 'All' && this.status ? this.status : (this.statusFilter !== 'All' ? this.statusFilter : '')

        const params: Record<string, any> = { page }
        if (searchVal) params.search = searchVal
        if (categoryVal && categoryVal !== 'All') params.category = categoryVal
        if (statusVal && statusVal !== 'All') params.status = statusVal

        const response = await getDances(params)
        const items = response?.data ? response.data : (Array.isArray(response) ? response : [])
        const normalized = items.map((dance: any) => this.normalizeDance(dance))

        if (append) {
          this.dances.push(...normalized)
        } else {
          this.dances = normalized
        }

        this.currentPage = response?.current_page ?? page
        this.lastPage = response?.last_page ?? 1

        const danceId = this.$route.params.id
        if (danceId) {
          const dance = this.dances.find(item => String(item.id) === String(danceId))
          if (dance) this.selectedDance = dance
        }
      } catch (error) {
        this.loadError = axios.isAxiosError(error) && error.response
          ? `The backend returned ${error.response.status}.`
          : 'Could not connect to the Laravel backend. Please try again.'
        this.$q.notify({
          type: 'negative',
          message: 'Could not connect to the backend server. Please make sure the backend is running.',
          position: 'top'
        })
        console.error('Load dances failed:', error)
      } finally {
        if (!append) {
          this.isInitialLoading = false
        }
      }
    },
    async onLoad(index: number, done: (stop?: boolean) => void) {
      if (this.currentPage >= this.lastPage) {
        if (typeof done === 'function') done(true)
        return
      }
      this.currentPage++
      await this.loadDances(this.currentPage, true)
      if (typeof done === 'function') {
        if (this.currentPage >= this.lastPage) {
          done(true)
        } else {
          done()
        }
      }
    },
    normalizeDance(dance: Partial<Dance>): Dance {
      const progress = Math.min(100, Math.max(0, Number(dance.progress) || 0))
      const uploadLink = typeof dance.uploadLink === 'string' && dance.uploadLink.trim()
        ? dance.uploadLink
        : (typeof (dance as any).upload_link === 'string' ? (dance as any).upload_link : '')
      const hasUploadLink = Boolean(uploadLink && uploadLink.trim())
      const normalizedProgress = hasUploadLink ? 100 : progress
      const result: Dance = {
        id: dance.id ?? 0,
        title: dance.title ?? 'Untitled Dance',
        artist: dance.artist ?? 'Unknown Artist',
        category: dance.category ?? 'Other',
        difficulty: dance.difficulty ?? 'Medium',
        status: this.deriveStatus(normalizedProgress, uploadLink),
        progress: normalizedProgress,
        favorite: Boolean(dance.favorite),
        coverImage: dance.coverImage || (dance as any).cover_image || '',
        sourceLink: dance.sourceLink || (dance as any).source_link || '',
        uploadLink: uploadLink,
        notes: dance.notes ?? ''
      }
      if (dance.rank !== undefined) {
        result.rank = dance.rank
      }
      return result
    },
    selectCoverImage(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0] || null
      this.form.coverFile = file
      if (file) this.form.coverImage = URL.createObjectURL(file)
    },
    async testApi() {
      this.backendLoading = true
      this.backendError = ''
      try {
        const response = await axios.get<{ message: string }>('/api/hello')
        this.backendMessage = response.data.message
      } catch (error) {
        this.backendMessage = ''
        this.backendError = axios.isAxiosError(error) && error.response ? `Backend returned ${error.response.status}.` : 'Could not connect to the Laravel backend. Make sure php artisan serve is running.'
      } finally {
        this.backendLoading = false
      }
    }
  },

  mounted() {
    const path = this.$route.path
    this.activeView = path.startsWith('/dances') ? 'dances' : path === '/discover' || path === '/favorites' ? path.slice(1) : 'home'
    this.statusFilter = this.activeView === 'dances' ? this.statusFromSlug(this.$route.query.status) : 'All'
    window.addEventListener('keydown', this.handleKeydown)
    document.body.classList.add('app-ready')
    this.loadDances()
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
    document.body.style.overflow = ''
    this.toasts.forEach(toast => {
      if (toast.timerId !== undefined) window.clearTimeout(toast.timerId)
    })
  },
  watch: {
    '$route.path'(path: string) {
      this.activeView = path.startsWith('/dances') ? 'dances' : path === '/discover' || path === '/favorites' ? path.slice(1) : 'home'
    },
    '$route.query.status'(status: unknown) {
      if (this.activeView === 'dances') {
        this.statusFilter = this.statusFromSlug(status)
        this.status = this.statusFilter
        this.loadDances(1, false)
      }
    },
    showForm(value: boolean) { document.body.style.overflow = value || Boolean(this.deleteTarget) || Boolean(this.selectedDance) ? 'hidden' : '' },
    selectedDance(value: Dance | null) { document.body.style.overflow = value || this.showForm || this.deleteTarget ? 'hidden' : '' },
    deleteTarget(value: Dance | null) { document.body.style.overflow = value || this.showForm || this.selectedDance ? 'hidden' : '' }
  },
})
</script>

<style scoped>
/* Component-specific Activity 2 styles. The shared DancePlay visual system lives in src/css/app.scss. */
.filter-dropdowns {
  display: flex;
  gap: 8px;
  align-items: center;
}
.filter-dropdown {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 9px;
  padding: 10px 14px;
  font-size: 11px;
  cursor: pointer;
  outline: none;
}
.filter-dropdown:focus {
  border-color: rgba(184, 108, 255, 0.5);
}
.api-demo-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  color: var(--text);
}
.api-demo-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.api-demo-copy strong {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 16px;
}
.api-demo-copy p { color: var(--muted); margin: 5px 0 0; font-size: 12px; }
.api-test-btn {
  min-width: 132px;
  border-radius: 11px;
}
.api-message, .api-error, .api-hint {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
}
.api-message { color: #d5ffc9; background: rgba(87,157,76,.14); border: 1px solid rgba(129,202,113,.28); }
.api-error { color: #ffb3bd; background: rgba(255,97,122,.08); border: 1px solid rgba(255,97,122,.2); }
.api-hint { color: var(--muted); background: rgba(255,255,255,.025); }
.api-hint code { color: #cdbdff; }
@media (max-width: 600px) {
  .api-demo-copy { align-items: stretch; flex-direction: column; }
  .api-test-btn { width: 100%; }
}
</style>
