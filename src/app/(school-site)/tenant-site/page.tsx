import { getSchoolFromHost } from '@/lib/get-school'
import { schoolSiteApi } from '@/features/school-site/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Hero } from '@/components/school-site/hero'
import { Stats } from '@/components/school-site/stats'
import { NoticeList } from '@/components/school-site/notice-list'
import { GalleryGrid } from '@/components/school-site/gallery-grid'

export default async function SchoolHomePage() {
  const school = await getSchoolFromHost()
  if (!school) notFound()

  const [notices, images, stats] = await Promise.all([
    schoolSiteApi
      .notices(school.id)
      .then((r) => r.notices)
      .catch(() => []),
    schoolSiteApi.gallery(school.id).catch(() => []),
    schoolSiteApi
      .stats(school.id)
      .catch(() => ({ students: 0, teachers: 0 })),
  ])

  return (
    <>
      <Hero school={school} />
      <Stats students={stats.students} teachers={stats.teachers} />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            Latest Notices
          </h2>
          <Link href="/notice" className="text-sm font-medium underline">
            View all
          </Link>
        </div>
        <NoticeList notices={notices} />
      </section>

      {images.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold"
              style={{ color: 'var(--primary)' }}
            >
              Gallery
            </h2>
            <Link href="/gallery" className="text-sm font-medium underline">
              View all
            </Link>
          </div>
          <GalleryGrid images={images.slice(0, 6)} />
        </section>
      )}

      <section
        className="py-16 text-center text-white"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <h2 className="text-3xl font-bold mb-3">Admission Open</h2>
        <p className="mb-6 opacity-90">Join our community today</p>
        <Link
          href="/admission"
          className="inline-block px-8 py-3 bg-white rounded-md font-semibold"
          style={{ color: 'var(--primary)' }}
        >
          Apply Now
        </Link>
      </section>
    </>
  )
}