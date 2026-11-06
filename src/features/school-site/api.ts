// src/features/school-site/api.ts
import type {
  SchoolPublic,
  SchoolNotice,
  SchoolGalleryImage,
  SchoolPageContent,
  SchoolStats,
} from './types'

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL

async function getJson<T>(path: string, revalidate = 120): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate } })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const schoolSiteApi = {
  resolveSchool: (identifier: string) =>
    getJson<{ school: SchoolPublic }>(
      `/api/public/schools/resolve?identifier=${encodeURIComponent(identifier)}`,
      300
    ).then((r) => r.school),

  stats: (schoolId: number) =>
    getJson<{ stats: SchoolStats }>(`/api/public/schools/${schoolId}/stats`)
      .then((r) => r.stats),

  notices: (schoolId: number, page = 1, limit = 10) =>
    getJson<{ notices: SchoolNotice[]; meta: any }>(
      `/api/public/schools/${schoolId}/notices?page=${page}&limit=${limit}`
    ),

  noticeById: (schoolId: number, id: number) =>
    getJson<{ notice: SchoolNotice }>(
      `/api/public/schools/${schoolId}/notices/${id}`
    ).then((r) => r.notice),

  gallery: (schoolId: number) =>
    getJson<{ images: SchoolGalleryImage[] }>(
      `/api/public/schools/${schoolId}/gallery`
    ).then((r) => r.images),

  pageContent: (schoolId: number, slug: string) =>
    getJson<{ content: SchoolPageContent | null }>(
      `/api/public/schools/${schoolId}/page/${slug}`
    ).then((r) => r.content),
}