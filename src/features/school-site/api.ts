// src/features/school-site/api.ts
import { env } from '@/config/env'
import type {
  SchoolPublic,
  SchoolNotice,
  SchoolGalleryImage,
  SchoolPageContent,
  SchoolStats,
} from './types'

const BASE = env.apiUrl

async function getJson<T>(path: string, revalidate = 120): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate } })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()
  return (json.data !== undefined ? json.data : json) as T
}

export const schoolSiteApi = {
  resolveSchool: (identifier: string) =>
    getJson<SchoolPublic>(
      `/public/schools/resolve?identifier=${encodeURIComponent(identifier)}`,
      300
    ),

  stats: (schoolId: number) =>
    getJson<SchoolStats>(`/public/schools/${schoolId}/stats`),

  notices: async (schoolId: number, page = 1, limit = 10) => {
    const res = await fetch(
      `${BASE}/public/schools/${schoolId}/notices?page=${page}&limit=${limit}`,
      { next: { revalidate: 120 } }
    )
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const json = await res.json()
    return {
      notices: (json.data !== undefined ? json.data : json.notices ?? []) as SchoolNotice[],
      meta: json.meta,
    }
  },

  noticeById: (schoolId: number, id: number) =>
    getJson<SchoolNotice>(`/public/schools/${schoolId}/notices/${id}`),

  gallery: (schoolId: number) =>
    getJson<SchoolGalleryImage[]>(`/public/schools/${schoolId}/gallery`),

  pageContent: (schoolId: number, slug: string) =>
    getJson<SchoolPageContent | null>(`/public/schools/${schoolId}/page/${slug}`),
}
