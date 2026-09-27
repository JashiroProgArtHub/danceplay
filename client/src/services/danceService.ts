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
  coverImage?: string
  cover_image?: string
  sourceLink?: string
  source_link?: string
  uploadLink?: string
  upload_link?: string
  notes?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  rank?: number
}

export interface DanceData {
  title?: string
  artist?: string
  category?: string
  difficulty?: string
  status?: string
  progress?: number
  favorite?: boolean
  coverImage?: string
  cover_image?: string
  coverFile?: File | null
  sourceLink?: string
  source_link?: string
  uploadLink?: string
  upload_link?: string
  notes?: string
}

function mapDance(data: any): Dance {
  return {
    ...data,
    id: data.id !== undefined ? Number(data.id) : 0,
    title: String(data.title ?? ''),
    artist: String(data.artist ?? ''),
    category: String(data.category ?? 'Other'),
    difficulty: String(data.difficulty ?? 'Medium'),
    status: String(data.status ?? 'Want to Learn'),
    progress: Number(data.progress ?? 0),
    favorite: Boolean(data.favorite),
    coverImage: String(data.cover_image ?? data.coverImage ?? ''),
    cover_image: String(data.cover_image ?? data.coverImage ?? ''),
    sourceLink: String(data.source_link ?? data.sourceLink ?? ''),
    source_link: String(data.source_link ?? data.sourceLink ?? ''),
    uploadLink: String(data.upload_link ?? data.uploadLink ?? ''),
    upload_link: String(data.upload_link ?? data.uploadLink ?? ''),
    notes: String(data.notes ?? ''),
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export const getDances = async (params: Record<string, any> = {}) => {
  const response = await api.get('/dances', { params })
  return response.data // Returns { data: [...], current_page, last_page }
}

export const createDance = async (dance: Partial<Dance> & { coverFile?: File | null }): Promise<Dance> => {
  const formData = new FormData()
  Object.entries(dance).forEach(([key, value]) => {
    if (value !== null && value !== undefined && key !== 'coverFile') {
      formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
    }
  })
  
  if (dance.coverFile) {
    formData.append('cover_image', dance.coverFile)
  }

  const response = await api.post('/dances', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const updateDance = async (id: number | string, dance: Partial<Dance> & { coverFile?: File | null }): Promise<Dance> => {
  const formData = new FormData()
  formData.append('_method', 'PATCH') // Spoof PATCH for PHP multipart routing
  
  Object.entries(dance).forEach(([key, value]) => {
    if (value !== null && value !== undefined && key !== 'coverFile' && key !== 'id') {
      formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
    }
  })

  if (dance.coverFile) {
    formData.append('cover_image', dance.coverFile)
  }

  const response = await api.post(`/dances/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteDance = async (id: number | string): Promise<void> => {
  await api.delete(`/dances/${id}`)
}
