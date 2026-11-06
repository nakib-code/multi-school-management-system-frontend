import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Youtube } from 'lucide-react'
import type { SchoolPublic } from '@/features/school-site/types'

export function SchoolFooter({ school }: { school: SchoolPublic }) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{school.name}</h3>
          {school.tagline && (
            <p className="text-sm text-gray-400">{school.tagline}</p>
          )}
          <div className="flex gap-3 mt-4">
            {school.facebookUrl && (
              <a
                href={school.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 hover:text-white" />
              </a>
            )}
            {school.youtubeUrl && (
              <a
                href={school.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 hover:text-white" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/admission" className="hover:text-white">Admission</Link></li>
            <li><Link href="/notice" className="hover:text-white">Notices</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            {school.contactEmail && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" /> {school.contactEmail}
              </li>
            )}
            {school.contactPhone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" /> {school.contactPhone}
              </li>
            )}
            {school.contactAddress && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <span>{school.contactAddress}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {school.name}. All rights reserved.
      </div>
    </footer>
  )
}