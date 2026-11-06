import type { SchoolPublic } from '@/features/school-site/types'

export function Hero({ school }: { school: SchoolPublic }) {
  return (
    <section
      className="relative py-24 text-white"
      style={{
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{school.name}</h1>
        {school.tagline && (
          <p className="text-lg md:text-xl opacity-90 mb-6">{school.tagline}</p>
        )}
        {school.description && (
          <p className="max-w-2xl mx-auto opacity-85 line-clamp-3">
            {school.description}
          </p>
        )}
      </div>
    </section>
  )
}