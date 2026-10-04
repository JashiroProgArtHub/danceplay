<template>
  <div class="toolbar">
    <label class="search-box">
      <span>⌕</span>
      <input
        v-model="store.searchQuery"
        type="search"
        placeholder="Search dances, artists, or categories..."
        @input="onSearchInput"
      >
    </label>

    <div class="filter-dropdowns">
      <select
        v-model="store.categoryFilter"
        class="filter-dropdown"
        aria-label="Filter by category"
        @change="onFilterChange"
      >
        <option value="All">All Categories</option>
        <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <select
        v-model="store.statusFilter"
        class="filter-dropdown status-select"
        aria-label="Filter by status"
        @change="onFilterChange"
      >
        <option value="All">All Statuses</option>
        <option
          v-for="filter in store.filters.filter(f => f !== 'All')"
          :key="filter"
          :value="filter"
        >
          {{ filter }}
        </option>
      </select>
    </div>

    <div class="filters">
      <button
        v-for="filter in store.filters"
        :key="filter"
        :class="{ selected: store.statusFilter === filter }"
        @click="onSelectStatus(filter)"
      >
        {{ filter }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDanceStore } from '../../stores/danceStore'

const emit = defineEmits<{
  (e: 'filterChanged'): void
  (e: 'statusSelected', filter: string): void
}>()

const store = useDanceStore()

let searchTimer: number | undefined

function onSearchInput() {
  if (searchTimer) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    void store.fetchDances(1, false)
    emit('filterChanged')
  }, 250)
}

function onFilterChange() {
  void store.fetchDances(1, false)
  emit('filterChanged')
}

function onSelectStatus(filter: string) {
  emit('statusSelected', filter)
}
</script>

<style scoped>
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
</style>
