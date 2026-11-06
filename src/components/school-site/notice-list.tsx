import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { SchoolNotice } from '@/features/school-site/types'

export function NoticeList({ notices }: { notices: SchoolNotice[] }) {
  if (!notices.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
        No notices published yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notices.map((n) => (
        <Link
          key={n.id}
          href={`/notice/${n.id}`}
          className="block p-4 bg-white border rounded-lg hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {n.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                <h3 className="font-semibold">{n.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {n.content?.replace(/<[^>]*>/g, '').slice(0, 150)}
              </p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {new Date(n.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}