import axios from 'axios'

export interface Dance {
  id: number
  title: string
  artist: string
  category: string
  difficulty: string
  status: string
  progress: number
  favorite: boolean
  coverImage: string
  sourceLink: string
  uploadLink: string
  notes: string
  createdAt?: string
  updatedAt?: string
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
  coverFile?: File | null
  sourceLink?: string
  uploadLink?: string
  notes?: string
}

type ApiDance = Record<string, unknown>

function mapDance(data: ApiDance): Dance {
  return {
    id: Number(data.id),
    title: String(data.title ?? ''),
    artist: String(data.artist ?? ''),
    category: String(data.category ?? 'Other'),
    difficulty: String(data.difficulty ?? 'Medium'),
    status: String(data.status ?? 'Want to Learn'),
    progress: Number(data.progress ?? 0),
    favorite: Boolean(data.favorite),
    coverImage: String(data.cover_image ?? data.coverImage ?? ''),
    sourceLink: String(data.source_link ?? data.sourceLink ?? ''),
    uploadLink: String(data.upload_link ?? data.uploadLink ?? ''),
    notes: String(data.notes ?? ''),
    createdAt: data.created_at as string | undefined,
    updatedAt: data.updated_at as string | undefined
  }
}

function toFormData(dance: DanceData): FormData {
  const formData = new FormData()
  if (dance.title !== undefined) formData.append('title', dance.title)
  if (dance.artist !== undefined) formData.append('artist', dance.artist)

  const fields: Array<[string, unknown]> = [
    ['category', dance.category],
    ['difficulty', dance.difficulty],
    ['status', dance.status],
    ['progress', dance.progress],
    ['favorite', dance.favorite === undefined ? undefined : dance.favorite ? '1' : '0'],
    ['source_link', dance.sourceLink],
    ['upload_link', dance.uploadLink],
    ['notes', dance.notes]
  ]
  fields.forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') formData.append(key, String(value))
  })
  if (dance.coverFile) {
    formData.append('cover_image', dance.coverFile)
  } else if (dance.coverImage) {
    formData.append('cover_image', dance.coverImage)
  }
  return formData
}

export async function getDances(): Promise<Dance[]> {
  const response = await axios.get<ApiDance[]>('/api/dances')
  return response.data.map(mapDance)
}

export async function createDance(dance: DanceData): Promise<Dance> {
  const response = await axios.post<ApiDance>('/api/dances', toFormData(dance))
  return mapDance(response.data)
}

export async function updateDance(id: number, dance: DanceData): Promise<Dance> {
  const formData = toFormData(dance)
  formData.append('_method', 'PATCH')
  const response = await axios.post<ApiDance>(`/api/dances/${id}`, formData)
  return mapDance(response.data)
}

export async function deleteDance(id: number): Promise<void> {
  await axios.delete(`/api/dances/${id}`)
}
