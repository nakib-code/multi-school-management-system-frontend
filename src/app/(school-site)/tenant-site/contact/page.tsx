import { getSchoolFromHost } from '@/lib/get-school'
import { notFound } from 'next/navigation'
import { ContactForm } from './contact-form'

export default async function ContactPage() {
  const school = await getSchoolFromHost()
  if (!school) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
      <div>
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: 'var(--primary)' }}
        >
          Contact Us
        </h1>
        <p className="mb-6 text-gray-600">
          Send us a message and we'll get back to you soon.
        </p>
        <ContactForm schoolId={school.id} />
      </div>

      <div className="space-y-6">
        <div className="space-y-2 text-sm">
          {school.contactEmail && (
            <p><strong>Email:</strong> {school.contactEmail}</p>
          )}
          {school.contactPhone && (
            <p><strong>Phone:</strong> {school.contactPhone}</p>
          )}
          {school.contactAddress && (
            <p><strong>Address:</strong> {school.contactAddress}</p>
          )}
        </div>
        {school.mapEmbedUrl && (
          <iframe
            src={school.mapEmbedUrl}
            className="w-full h-80 rounded-lg border"
            loading="lazy"
            title="Map"
          />
        )}
      </div>
    </div>
  )
}