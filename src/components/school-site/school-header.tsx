'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { SchoolPublic } from '@/features/school-site/types'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/admission', label: 'Admission' },
  { href: '/notice', label: 'Notices' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export function SchoolHeader({ school }: { school: SchoolPublic }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          {school.logo ? (
            <Image
              src={school.logo}
              alt={school.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {school.name.charAt(0)}
            </div>
          )}
          <div>
            <p
              className="font-bold text-lg leading-tight"
              style={{ color: 'var(--primary)' }}
            >
              {school.name}
            </p>
            {school.tagline && (
              <p className="text-xs text-gray-500 line-clamp-1">
                {school.tagline}
              </p>
            )}
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:opacity-70 transition"
              style={{ color: 'var(--primary)' }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-md text-white text-sm font-semibold hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Login
          </Link>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium"
              style={{ color: 'var(--primary)' }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="block text-center py-2 rounded-md text-white text-sm font-semibold"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Login
          </Link>
        </div>
      )}
    </header>
  )
}