import { defineStore } from 'pinia'
import axios from 'axios'
import { Notify } from 'quasar'
import {
  getDances,
  getTrendingDances,
  getDanceStats,
  type DanceStats,
  createDance as createDanceApi,
  updateDance as updateDanceApi,
  deleteDance as deleteDanceApi,
  restoreDance as restoreDanceApi,
  type Dance
} from '../services/danceService'

export interface Toast {
  id: number
  message: string
  actionLabel?: string | undefined
  onAction?: (() => void) | undefined
  timerId?: number | undefined
}

export type RawDancePayload = Partial<Dance> & {
  cover_image?: string | undefined
  source_link?: string | undefined
  upload_link?: string | undefined
}

const DEFAULT_COVERS = Array.from({ length: 9 }, (_, index) => `/default-cover-${index + 1}.svg`)

export function deriveStatus(progress: number, uploadLink?: string): string {
  if (typeof uploadLink === 'string' && uploadLink.trim()) return 'Uploaded'
  if (progress >= 75) return 'Ready to Film'
  if (progress > 0) return 'Learning'
  return 'Want to Learn'
}

export function normalizeDance(dance: RawDancePayload): Dance {
  const progress = Math.min(100, Math.max(0, Number(dance.progress) || 0))
  const uploadLink =
    typeof dance.uploadLink === 'string' && dance.uploadLink.trim()
      ? dance.uploadLink
      : typeof dance.upload_link === 'string'
        ? dance.upload_link
        : ''
  const hasUploadLink = Boolean(uploadLink && uploadLink.trim())
  const normalizedProgress = hasUploadLink ? 100 : progress

  return {
    id: dance.id ?? 0,
    title: dance.title ?? 'Untitled Dance',
    artist: dance.artist ?? 'Unknown Artist',
    category: dance.category ?? 'Other',
    difficulty: dance.difficulty ?? 'Medium',
    status: deriveStatus(normalizedProgress, uploadLink),
    progress: normalizedProgress,
    favorite: Boolean(dance.favorite),
    coverImage: dance.coverImage || dance.cover_image || '',
    sourceLink: dance.sourceLink || dance.source_link || '',
    uploadLink,
    notes: dance.notes ?? '',
    rank: dance.rank
  }
}

export function isUsableCover(cover?: string): boolean {
  if (!cover || typeof cover !== 'string') return false
  const trimmed = cover.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/')) return true
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:image/')) return true
  const withProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withProtocol)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function extractYouTubeId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  const regExp = /(?:youtu\.be\/|(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/))([a-zA-Z0-9_-]{11})/i
  const match = trimmed.match(regExp)
  return match && match[1] ? match[1] : null
}

export function coverForDance(dance?: Partial<Dance> | null): string {
  if (!dance) return DEFAULT_COVERS[0] ?? '/default-cover-1.svg'
  const cover = dance.coverImage || (dance as RawDancePayload).cover_image
  if (cover && isUsableCover(cover)) return cover
  const ytId = extractYouTubeId(dance.sourceLink || (dance as RawDancePayload).source_link)
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
  const key = String(dance.id || `${dance.title}:${dance.artist}`)
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0
  }
  return DEFAULT_COVERS[hash % DEFAULT_COVERS.length] ?? '/default-cover-1.svg'
}

export const useDanceStore = defineStore('dance', {
  state: () => ({
    dances: [] as Dance[],
    trendingDances: [] as Dance[],
    isInitialLoading: true,
    loadError: '',
    currentPage: 1,
    lastPage: 1,
    totalCount: 0,
    searchQuery: '',
    categoryFilter: 'All',
    statusFilter: 'All',
    categories: ['K-Pop', 'TikTok', 'Dance Cover', 'Hip-Hop', 'Choreography', 'Freestyle', 'Other'],
    filters: ['All', 'Want to Learn', 'Learning', 'Ready to Film', 'Uploaded'],
    defaultCover: (DEFAULT_COVERS[0] ?? '/default-cover-1.svg') as string,
    stats: null as DanceStats | null,
    
    // Modals state
    selectedDance: null as Dance | null,
    editingDance: null as Dance | null,
    showForm: false,
    mutationLoading: false,
    favoritePulseId: null as number | string | null,

    // Toast state
    toasts: [] as Toast[],
    nextToastId: 1
  }),

  getters: {
    totalDances: (state) => (state.stats ? state.stats.total : state.totalCount > 0 ? state.totalCount : state.dances.length),
    learningCount: (state) => (state.stats ? state.stats.learning : state.dances.filter((d) => d.status === 'Learning').length),
    readyCount: (state) => (state.stats ? state.stats.ready : state.dances.filter((d) => d.status === 'Ready to Film').length),
    uploadedCount: (state) => (state.stats ? state.stats.uploaded : state.dances.filter((d) => d.status === 'Uploaded').length),
    learningDances: (state) => state.dances.filter((d) => d.status === 'Learning'),
    uploadedDances: (state) => state.dances.filter((d) => d.status === 'Uploaded'),
    favoriteDances: (state) => state.dances.filter((d) => d.favorite),
    nextDance: (state): Dance | null => {
      const statuses = ['Ready to Film', 'Learning', 'Want to Learn']
      for (const status of statuses) {
        const candidates = state.dances.filter((d) => d.status === status)
        if (candidates.length) {
          return candidates.reduce((highest, dance) =>
            Number(dance.progress) > Number(highest.progress) ? dance : highest
          )
        }
      }
      return null
    }
  },

  actions: {
    findOwnedDance(dance: Partial<Dance>): Dance | undefined {
      if (!dance) return undefined
      return this.dances.find(
        (item) =>
          (dance.id !== undefined && dance.id !== null && String(item.id) === String(dance.id)) ||
          (dance.title && dance.artist && item.title.toLowerCase() === dance.title.toLowerCase() && item.artist.toLowerCase() === dance.artist.toLowerCase())
      )
    },

    isFavorite(dance: Partial<Dance>): boolean {
      if (dance.id !== undefined && dance.id !== null) {
        const match = this.dances.find((item) => String(item.id) === String(dance.id))
        if (match) return Boolean(match.favorite)
        const inTrending = this.trendingDances.find((item) => String(item.id) === String(dance.id))
        if (inTrending) return Boolean(inTrending.favorite)
      }
      const owned = this.findOwnedDance(dance)
      if (owned) return Boolean(owned.favorite)
      return Boolean(dance.favorite)
    },

    showToast(message: string, actionLabel?: string, onAction?: () => void) {
      const duration = actionLabel ? 7000 : 3000
      const existing = this.toasts.find((t) => t.message === message)
      if (existing) {
        if (existing.timerId !== undefined) window.clearTimeout(existing.timerId)
        existing.actionLabel = actionLabel
        existing.onAction = onAction
        existing.timerId = window.setTimeout(() => this.dismissToast(existing.id), duration)
        return
      }

      const toast: Toast = { id: this.nextToastId++, message, actionLabel, onAction }
      toast.timerId = window.setTimeout(() => this.dismissToast(toast.id), duration)
      const nextToasts = [...this.toasts, toast]
      nextToasts.slice(0, -2).forEach((item) => {
        if (item.timerId !== undefined) window.clearTimeout(item.timerId)
      })
      this.toasts = nextToasts.slice(-2)
    },

    dismissToast(id: number) {
      const toast = this.toasts.find((item) => item.id === id)
      if (toast?.timerId !== undefined) window.clearTimeout(toast.timerId)
      this.toasts = this.toasts.filter((item) => item.id !== id)
    },

    openDance(dance: Dance) {
      this.selectedDance = this.findOwnedDance(dance) || dance
    },

    closeDance() {
      this.selectedDance = null
    },

    openAddModal() {
      this.editingDance = null
      this.showForm = true
      this.selectedDance = null
    },

    openEditModal(dance: Dance) {
      const owned = this.findOwnedDance(dance) || dance
      this.editingDance = owned
      this.showForm = true
      this.selectedDance = null
    },

    closeForm() {
      this.showForm = false
      this.editingDance = null
    },

    async fetchDances(page = 1, append = false) {
      if (!append) {
        this.isInitialLoading = true
      }
      this.loadError = ''
      try {
        const searchVal = this.searchQuery.trim()
        const categoryVal = this.categoryFilter !== 'All' ? this.categoryFilter : ''
        const statusVal = this.statusFilter !== 'All' ? this.statusFilter : ''

        const params: Record<string, string | number | boolean> = { page }
        if (searchVal) params.search = searchVal
        if (categoryVal) params.category = categoryVal
        if (statusVal) params.status = statusVal

        const response = await getDances(params)
        const items = response?.data ? response.data : []
        const normalized = items.map((dance: RawDancePayload) => normalizeDance(dance))

        if (append) {
          this.dances.push(...normalized)
        } else {
          this.dances = normalized
        }

        this.currentPage = response?.current_page ?? page
        this.lastPage = response?.last_page ?? 1
        this.totalCount = response?.total ?? (append ? this.totalCount + normalized.length : normalized.length)
      } catch (error) {
        this.loadError =
          axios.isAxiosError(error) && error.response
            ? `The backend returned ${error.response.status}.`
            : 'Could not connect to the Laravel backend. Please try again.'
        console.error('Fetch dances failed:', error)
      } finally {
        if (!append) {
          this.isInitialLoading = false
        }
      }
    },

    async fetchTrendingDances() {
      try {
        const response = await getTrendingDances()
        if (Array.isArray(response) && response.length > 0) {
          this.trendingDances = response.map((dance: RawDancePayload, index: number) => {
            const normalized = normalizeDance(dance)
            normalized.rank = dance.rank ?? index + 1
            return normalized
          })
        } else {
          this.trendingDances = []
        }
      } catch (error) {
        console.error('Fetch top rotation dances failed:', error)
        this.trendingDances = []
      }
    },

    async fetchStats() {
      try {
        const stats = await getDanceStats()
        this.stats = stats
      } catch (error) {
        console.error('Fetch stats failed:', error)
      }
    },

    async saveDance(formData: Partial<Dance>, coverFile?: File | null) {
      this.mutationLoading = true
      const hasUploadLink = Boolean(formData.uploadLink && formData.uploadLink.trim())
      const cleanProgress = Math.min(100, Math.max(0, Number(formData.progress) || 0))
      const coverImageChanged = !this.editingDance || formData.coverImage !== this.editingDance.coverImage

      const data: Partial<Dance> & { coverFile?: File | null } = {
        ...formData,
        status: deriveStatus(cleanProgress, formData.uploadLink || ''),
        progress: hasUploadLink ? 100 : cleanProgress,
        favorite: this.editingDance ? Boolean(this.editingDance.favorite) : false
      }
      if (coverFile) {
        data.coverFile = coverFile
        delete data.coverImage
      } else if (coverImageChanged) {
        data.coverImage = formData.coverImage || ''
      } else {
        delete data.coverImage
      }

      // Auto-attach YouTube thumbnail if cover is unset or set to youtube, and sourceLink is present
      const userResetCover = coverImageChanged && !formData.coverImage && !coverFile
      if (!data.coverImage && !coverFile && data.sourceLink && !userResetCover) {
        const ytId = extractYouTubeId(data.sourceLink)
        if (ytId) {
          data.coverImage = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        }
      }

      try {
        const isEditing = Boolean(this.editingDance)
        const saved = isEditing
          ? await updateDanceApi(Number(this.editingDance!.id), data)
          : await createDanceApi(data)

        const normalized = normalizeDance(saved)
        if (isEditing) {
          const editId = String(this.editingDance!.id)
          const index = this.dances.findIndex((d) => String(d.id) === editId)
          if (index !== -1) {
            this.dances.splice(index, 1, normalized)
          } else {
            this.dances.unshift(normalized)
          }
          const tIndex = this.trendingDances.findIndex((d) => String(d.id) === editId)
          if (tIndex !== -1) {
            this.trendingDances.splice(tIndex, 1, { ...normalized, rank: this.trendingDances[tIndex]?.rank })
          }
          if (this.selectedDance && String(this.selectedDance.id) === editId) {
            this.selectedDance = normalized
          }
        } else {
          this.dances.unshift(normalized)
          this.totalCount = (this.totalCount || 0) + 1
        }
        this.showToast(isEditing ? 'Changes saved' : 'Dance added to collection')
        this.closeForm()
        void this.fetchStats()
        void this.fetchTrendingDances()
      } catch (error) {
        console.error('Save dance failed:', error)
        Notify.create({
          type: 'negative',
          message: 'Could not save this dance. Please check your connection and try again.',
          position: 'top-right'
        })
        throw error
      } finally {
        this.mutationLoading = false
      }
    },

    async addToMyDances(dance: Dance) {
      const existing = this.findOwnedDance(dance)
      if (existing) {
        this.selectedDance = existing
        return existing
      }
      try {
        const saved = await createDanceApi({
          title: dance.title,
          artist: dance.artist,
          category: dance.category,
          difficulty: dance.difficulty,
          status: 'Want to Learn',
          progress: 0,
          favorite: false,
          sourceLink: dance.sourceLink,
          notes: dance.notes,
          coverImage: dance.coverImage
        })
        if (dance.coverImage && !saved.coverImage) saved.coverImage = dance.coverImage
        const normalized = normalizeDance(saved)
        this.dances.unshift(normalized)
        this.totalCount = (this.totalCount || 0) + 1
        this.selectedDance = normalized
        this.showToast('Dance added to collection')
        void this.fetchStats()
        void this.fetchTrendingDances()
        return normalized
      } catch (error) {
        console.error('Add to my dances failed:', error)
        Notify.create({
          type: 'negative',
          message: 'Could not add dance to collection. Please try again.',
          position: 'top-right'
        })
        throw error
      }
    },

    async confirmDelete(dance?: Dance | null) {
      if (!dance) return
      this.mutationLoading = true
      const deletedId = dance.id
      const deletedTitle = dance.title
      try {
        await deleteDanceApi(Number(dance.id))
        this.dances = this.dances.filter((d) => String(d.id) !== String(deletedId))
        this.trendingDances = this.trendingDances.filter((d) => String(d.id) !== String(deletedId))
        this.totalCount = Math.max(0, (this.totalCount || 1) - 1)
        if (this.selectedDance && String(this.selectedDance.id) === String(deletedId)) {
          this.selectedDance = null
        }
        void this.fetchStats()
        void this.fetchTrendingDances()
        this.showToast(`Deleted “${deletedTitle}”`, 'Undo', () => {
          void this.restoreDance(deletedId)
        })
        Notify.create({
          message: `Deleted “${deletedTitle}”`,
          color: 'purple-10',
          textColor: 'white',
          position: 'bottom-right',
          timeout: 7000,
          actions: [
            {
              label: 'Undo',
              color: 'yellow',
              handler: () => {
                void this.restoreDance(deletedId)
              }
            }
          ]
        })
      } catch (error) {
        console.error('Delete dance failed:', error)
        Notify.create({
          type: 'negative',
          message: 'Could not delete dance. Please try again.',
          position: 'top-right'
        })
        throw error
      } finally {
        this.mutationLoading = false
      }
    },

    async restoreDance(id: number | string) {
      try {
        const restored = await restoreDanceApi(id)
        const normalized = normalizeDance(restored)
        const exists = this.dances.some((d) => String(d.id) === String(normalized.id))
        if (!exists) {
          this.dances.unshift(normalized)
          this.totalCount = (this.totalCount || 0) + 1
        }
        this.showToast(`Restored “${normalized.title}”`)
        Notify.create({
          message: `Restored “${normalized.title}”`,
          color: 'positive',
          position: 'bottom-right',
          timeout: 3000
        })
        void this.fetchStats()
        void this.fetchTrendingDances()
      } catch (error) {
        console.error('Restore dance failed:', error)
        Notify.create({
          type: 'negative',
          message: 'Could not restore dance.',
          position: 'top-right'
        })
      }
    },

    async toggleFavorite(dance: Dance) {
      const targetId = dance.id
      const newFavStatus = !dance.favorite

      // Optimistically update everywhere in state
      dance.favorite = newFavStatus

      const inDances = this.dances.find((d) => String(d.id) === String(targetId))
      if (inDances) inDances.favorite = newFavStatus

      const inTrending = this.trendingDances.find((d) => String(d.id) === String(targetId))
      if (inTrending) inTrending.favorite = newFavStatus

      if (this.selectedDance && String(this.selectedDance.id) === String(targetId)) {
        this.selectedDance.favorite = newFavStatus
      }

      this.favoritePulseId = targetId
      window.setTimeout(() => {
        if (String(this.favoritePulseId) === String(targetId)) this.favoritePulseId = null
      }, 220)

      try {
        await updateDanceApi(Number(targetId), { favorite: newFavStatus })
        this.showToast(newFavStatus ? 'Added to favorites' : 'Removed from favorites')
        void this.fetchStats()
        void this.fetchTrendingDances()
      } catch (error) {
        dance.favorite = !newFavStatus
        if (inDances) inDances.favorite = !newFavStatus
        if (inTrending) inTrending.favorite = !newFavStatus
        if (this.selectedDance && String(this.selectedDance.id) === String(targetId)) {
          this.selectedDance.favorite = !newFavStatus
        }
        Notify.create({
          type: 'negative',
          message: 'Could not update favorite status.',
          position: 'top-right'
        })
        throw error
      }
    },

    async updateProgress(dance: Dance, amount: number) {
      const targetId = dance.id
      const prevProgress = dance.progress
      const prevStatus = dance.status
      dance.progress = Math.min(100, Math.max(0, dance.progress + amount))
      this.syncStatusAfterProgress(dance)

      const inDances = this.dances.find((d) => String(d.id) === String(targetId))
      if (inDances) {
        inDances.progress = dance.progress
        inDances.status = dance.status
      }
      const inTrending = this.trendingDances.find((d) => String(d.id) === String(targetId))
      if (inTrending) {
        inTrending.progress = dance.progress
        inTrending.status = dance.status
      }

      try {
        await updateDanceApi(Number(targetId), {
          progress: dance.progress,
          status: dance.status,
          uploadLink: dance.uploadLink
        })
        void this.fetchStats()
        void this.fetchTrendingDances()
      } catch (error) {
        dance.progress = prevProgress
        dance.status = prevStatus
        if (inDances) {
          inDances.progress = prevProgress
          inDances.status = prevStatus
        }
        if (inTrending) {
          inTrending.progress = prevProgress
          inTrending.status = prevStatus
        }
        Notify.create({
          type: 'negative',
          message: 'Could not update progress.',
          position: 'top-right'
        })
        throw error
      }
    },

    async setProgress(dance: Dance, amount: number) {
      const targetId = dance.id
      const prevProgress = dance.progress
      const prevStatus = dance.status
      dance.progress = Math.min(100, Math.max(0, amount))
      this.syncStatusAfterProgress(dance)

      const inDances = this.dances.find((d) => String(d.id) === String(targetId))
      if (inDances) {
        inDances.progress = dance.progress
        inDances.status = dance.status
      }
      const inTrending = this.trendingDances.find((d) => String(d.id) === String(targetId))
      if (inTrending) {
        inTrending.progress = dance.progress
        inTrending.status = dance.status
      }

      try {
        await updateDanceApi(Number(targetId), {
          progress: dance.progress,
          status: dance.status,
          uploadLink: dance.uploadLink
        })
        void this.fetchStats()
        void this.fetchTrendingDances()
      } catch (error) {
        dance.progress = prevProgress
        dance.status = prevStatus
        if (inDances) {
          inDances.progress = prevProgress
          inDances.status = prevStatus
        }
        if (inTrending) {
          inTrending.progress = prevProgress
          inTrending.status = prevStatus
        }
        Notify.create({
          type: 'negative',
          message: 'Could not update progress.',
          position: 'top-right'
        })
        throw error
      }
    },

    syncStatusAfterProgress(dance: Dance) {
      const hasUploadLink = typeof dance.uploadLink === 'string' && dance.uploadLink.trim()
      if (hasUploadLink) dance.progress = 100
      dance.status = deriveStatus(dance.progress, dance.uploadLink)
    }
  }
})
