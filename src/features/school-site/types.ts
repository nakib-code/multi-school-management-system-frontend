// src/features/school-site/types.ts
export interface SchoolPublic {
  id: number
  name: string
  code: string
  logo: string | null
  tagline: string | null
  description: string | null
  primaryColor: string | null
  secondaryColor: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
  mapEmbedUrl: string | null
  schoolType: string
}

export interface SchoolNotice {
  id: number
  title: string
  content: string
  category: string | null
  isPinned: boolean
  publishedAt: string
  expiresAt: string | null
}

export interface SchoolGalleryImage {
  id: number
  url: string
  caption: string | null
  category: string | null
  sortOrder: number
}

export interface SchoolPageContent {
  id: number
  schoolId: number
  slug: string
  title: string
  content: string
}

export interface SchoolStats {
  students: number
  teachers: number
}