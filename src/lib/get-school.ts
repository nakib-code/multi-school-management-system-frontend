// src/lib/get-school.ts
import { headers } from 'next/headers'
import { cache } from 'react'
import { env } from '@/config/env'
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

  try {
    const res = await fetch(
      `${env.apiUrl}/public/schools/resolve?identifier=${encodeURIComponent(identifier)}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null

    const json = await res.json()
    return json.data ?? json.school ?? null
  } catch (err) {
    console.error('[getSchoolFromHost] Failed to resolve school:', err)
    return null
  }
})
