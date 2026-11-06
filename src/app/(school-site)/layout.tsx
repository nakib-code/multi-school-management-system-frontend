import { notFound } from 'next/navigation'
import { SchoolHeader } from '@/components/school-site/school-header'
import { SchoolFooter } from '@/components/school-site/school-footer'
import { getSchoolFromHost } from '@/lib/get-school'

export default async function SchoolSiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const school = await getSchoolFromHost()
  if (!school) notFound()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={
        {
          '--primary': school.primaryColor || '#0F766E',
          '--secondary': school.secondaryColor || '#F59E0B',
        } as React.CSSProperties
      }
    >
      <SchoolHeader school={school} />
      <main className="flex-1">{children}</main>
      <SchoolFooter school={school} />
    </div>
  )
}