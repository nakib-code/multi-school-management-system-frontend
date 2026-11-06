// src/lib/get-school.ts (reference)
import { headers } from 'next/headers'
import { cache } from 'react'
import type { SchoolPublic } from '@/features/school-site/types'

export const getSchoolFromHost = cache(async (): Promise<SchoolPublic | null> => {
  const h = await headers()
  let identifier = h.get('x-school-identifier') || ''

  // local dev fallback — ?school=xyz
  if (!identifier) {
    const referer = h.get('referer') || ''
    try {
      const u = new URL(referer)
      identifier = u.searchParams.get('school') || ''
    } catch {}
  }
  if (!identifier) return null

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/schools/resolve?identifier=${encodeURIComponent(identifier)}`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return null

  const json = await res.json()
  return json.school
})