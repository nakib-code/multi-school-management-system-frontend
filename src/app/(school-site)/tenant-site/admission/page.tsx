import AdmissionForm from '@/components/admissions/admission-form'
import { getSchoolFromHost } from '@/lib/get-school'
import { notFound } from 'next/navigation'

export default async function SchoolAdmissionPage() {
  const school = await getSchoolFromHost()
  if (!school) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: 'var(--primary)' }}
      >
        Admission Application
      </h1>
      <p className="text-gray-600 mb-8">
        Fill in the form below. We'll contact you after review.
      </p>
      <AdmissionForm schoolId={school.id} />
    </div>
  )
}