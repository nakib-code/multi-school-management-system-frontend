import { getSchoolFromHost } from '@/lib/get-school'
import { schoolSiteApi } from '@/features/school-site/api'
import { notFound } from 'next/navigation'
import { NoticeList } from '@/components/school-site/notice-list'

export default async function NoticePage() {
  const school = await getSchoolFromHost()
  if (!school) notFound()

  const { notices } = await schoolSiteApi.notices(school.id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: 'var(--primary)' }}
      >
        Notice Board
      </h1>
      <NoticeList notices={notices} />
    </div>
  )
}