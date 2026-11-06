import { getSchoolFromHost } from '@/lib/get-school'
import { schoolSiteApi } from '@/features/school-site/api'
import { notFound } from 'next/navigation'

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const school = await getSchoolFromHost()
  if (!school) notFound()

  const notice = await schoolSiteApi.noticeById(school.id, Number(id))
  if (!notice) notFound()

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: 'var(--primary)' }}
      >
        {notice.title}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {new Date(notice.publishedAt).toLocaleDateString()}
      </p>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: notice.content }}
      />
    </article>
  )
}