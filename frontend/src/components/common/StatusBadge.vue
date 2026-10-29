<template>
  <!-- Trending Ranking Badge on Card -->
  <span v-if="mode === 'card' && isTrending && rank" class="trend-badge">
    ★ #{{ rank }}
  </span>

  <!-- Detail Modal Variant -->
  <div
    v-else-if="mode === 'detail'"
    class="detail-status"
    :class="statusClass"
  >
    <span>{{ detailText }}</span>
  </div>

  <!-- Standard Card Status Pill Variant -->
  <span
    v-else
    :class="cardBadgeClasses"
  >
    {{ cardText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: string
    progress?: number
    isTrending?: boolean
    rank?: number | undefined
    isUploaded?: boolean
    mode?: 'card' | 'detail'
  }>(),
  {
    progress: 0,
    isTrending: false,
    isUploaded: false,
    mode: 'card'
  }
)

const statusClass = computed(() => {
  switch (props.status) {
    case 'Want to Learn':
      return 'status-want'
    case 'Learning':
      return 'status-learning'
    case 'Ready to Film':
      return 'status-ready'
    case 'Uploaded':
      return 'status-uploaded'
    default:
      return ''
  }
})

const cardBadgeClasses = computed(() => {
  if (props.isUploaded || props.status === 'Uploaded') {
    return 'uploaded-badge'
  }
  return ['status-pill', statusClass.value]
})

const cardText = computed(() => {
  if (props.isUploaded || props.status === 'Uploaded') {
    return '✓ UPLOADED'
  }
  if (props.status === 'Ready to Film' && props.progress >= 100) {
    return '⭐ 100% MASTERED'
  }
  if (props.status === 'Want to Learn') {
    return 'WANT TO LEARN'
  }
  if (props.status === 'Learning') {
    return 'LEARNING'
  }
  if (props.status === 'Ready to Film') {
    return 'READY TO FILM'
  }
  return props.status?.toUpperCase() || ''
})

const detailText = computed(() => {
  if (props.status === 'Want to Learn') {
    return '💭 WANT TO LEARN'
  }
  if (props.status === 'Learning') {
    return '◌ LEARNING'
  }
  if (props.status === 'Ready to Film' && props.progress >= 100) {
    return '⭐ 100% MASTERED · READY TO FILM'
  }
  if (props.status === 'Ready to Film') {
    return '🎥 READY TO FILM'
  }
  if (props.status === 'Uploaded') {
    return '✓ UPLOADED'
  }
  return props.status || ''
})
</script>
