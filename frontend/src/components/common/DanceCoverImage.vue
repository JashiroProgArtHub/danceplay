<template>
  <img
    :src="computedSrc"
    :alt="alt || (dance ? `${dance.title} cover` : 'Dance cover')"
    :class="imgClass"
    loading="lazy"
    @error="onError"
  >
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDanceStore, coverForDance } from '../../stores/danceStore'
import type { Dance } from '../../services/danceService'

const props = defineProps<{
  src?: string
  dance?: Dance | null
  alt?: string
  imgClass?: string
}>()

const store = useDanceStore()
const hasError = ref(false)

// Reset error state if image source changes
watch(
  () => [props.src, props.dance?.coverImage, props.dance?.sourceLink],
  () => {
    hasError.value = false
  }
)

const computedSrc = computed(() => {
  if (hasError.value) {
    return store.defaultCover
  }
  if (props.src) {
    return props.src
  }
  if (props.dance) {
    return coverForDance(props.dance)
  }
  return store.defaultCover
})

function onError(e: Event) {
  hasError.value = true
  const target = e.target as HTMLImageElement
  target.src = store.defaultCover
}
</script>
