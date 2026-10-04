import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export interface Dance {
  id: number | string
  title: string
  artist: string
  category: string
  difficulty: string
  status: string
  progress: number
  favorite: boolean
  coverImage?: string | undefined
  cover_image?: string | undefined
  sourceLink?: string | undefined
  source_link?: string | undefined
  uploadLink?: string | undefined
  upload_link?: string | undefined
  notes?: string | undefined
  createdAt?: string | undefined
  created_at?: string | undefined
  updatedAt?: string | undefined
  updated_at?: string | undefined
  rank?: number | undefined
}

export interface PaginatedDancesResponse {
  data: Dance[]
  current_page: number
  last_page: number
  total: number
}

export const getDances = async (
  params: Record<string, string | number | boolean> = {}
): Promise<PaginatedDancesResponse> => {
  const response = await api.get<PaginatedDancesResponse>('/dances', { params })
  return response.data
}

export interface DanceStats {
  total: number
  learning: number
  ready: number
  uploaded: number
  want_to_learn: number
  favorites: number
}

export const getDanceStats = async (): Promise<DanceStats> => {
  const response = await api.get<DanceStats>('/dances/stats')
  return response.data
}

export const getTrendingDances = async (): Promise<Dance[]> => {
  const response = await api.get<Dance[]>('/dances/trending')
  return response.data
}

export const createDance = async (
  dance: Partial<Dance> & { coverFile?: File | null }
): Promise<Dance> => {
  const formData = new FormData()
  Object.entries(dance).forEach(([key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      key !== 'coverFile' &&
      key !== 'coverImage' &&
      key !== 'cover_image' &&
      key !== 'id'
    ) {
      formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
    }
  })

  if (dance.coverFile) {
    formData.append('cover_image', dance.coverFile)
  } else if (dance.coverImage !== undefined) {
    formData.append('cover_image', dance.coverImage)
  } else if (dance.cover_image !== undefined) {
    formData.append('cover_image', dance.cover_image)
  }

  const response = await api.post<Dance>('/dances', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const updateDance = async (
  id: number | string,
  dance: Partial<Dance> & { coverFile?: File | null }
): Promise<Dance> => {
  const formData = new FormData()
  formData.append('_method', 'PATCH')

  Object.entries(dance).forEach(([key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      key !== 'coverFile' &&
      key !== 'coverImage' &&
      key !== 'cover_image' &&
      key !== 'id'
    ) {
      formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
    }
  })

  if (dance.coverFile) {
    formData.append('cover_image', dance.coverFile)
  } else if (dance.coverImage !== undefined) {
    formData.append('cover_image', dance.coverImage)
  } else if (dance.cover_image !== undefined) {
    formData.append('cover_image', dance.cover_image)
  }

  const response = await api.post<Dance>(`/dances/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteDance = async (id: number | string): Promise<void> => {
  await api.delete(`/dances/${id}`)
}

export const restoreDance = async (id: number | string): Promise<Dance> => {
  const response = await api.post<Dance>(`/dances/${id}/restore`)
  return response.data
}
