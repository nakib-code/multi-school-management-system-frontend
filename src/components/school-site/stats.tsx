import { Users, GraduationCap, Calendar } from 'lucide-react'

export function Stats({
  students,
  teachers,
}: {
  students: number
  teachers: number
}) {
  return (
    <section className="max-w-5xl mx-auto px-4 -mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
        <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
          {students}
        </p>
        <p className="text-sm text-gray-600 mt-1">Students</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <GraduationCap className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
        <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
          {teachers}
        </p>
        <p className="text-sm text-gray-600 mt-1">Teachers</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 text-center col-span-2 md:col-span-1">
        <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
        <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
          {new Date().getFullYear()}
        </p>
        <p className="text-sm text-gray-600 mt-1">Academic Year</p>
      </div>
    </section>
  )
}