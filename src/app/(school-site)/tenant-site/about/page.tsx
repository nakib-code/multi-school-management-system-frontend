import { getSchoolFromHost } from '@/lib/get-school'
import { schoolSiteApi } from '@/features/school-site/api'
import { notFound } from 'next/navigation'

export default async function AboutPage() {
  const school = await getSchoolFromHost()
  if (!school) notFound()

  const content = await schoolSiteApi
    .pageContent(school.id, 'about')
    .catch(() => null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: 'var(--primary)' }}
      >
        {content?.title || 'About Us'}
      </h1>

      {content?.content ? (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      ) : (
        <p className="text-gray-600">
          {school.description || 'About information coming soon.'}
        </p>
      )}
    </div>
  )
}