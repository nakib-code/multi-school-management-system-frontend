import { getSchoolFromHost } from '@/lib/get-school'
import { schoolSiteApi } from '@/features/school-site/api'
import { notFound } from 'next/navigation'
import { GalleryGrid } from '@/components/school-site/gallery-grid'

export default async function GalleryPage() {
  const school = await getSchoolFromHost()
  if (!school) notFound()

  const images = await schoolSiteApi.gallery(school.id).catch(() => [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: 'var(--primary)' }}
      >
        Gallery
      </h1>
      {images.length ? (
        <GalleryGrid images={images} />
      ) : (
        <p className="text-gray-500">No photos yet.</p>
      )}
    </div>
  )
}