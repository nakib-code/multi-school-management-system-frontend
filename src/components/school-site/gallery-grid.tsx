import Image from 'next/image'
import type { SchoolGalleryImage } from '@/features/school-site/types'

export function GalleryGrid({ images }: { images: SchoolGalleryImage[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
        >
          <Image
            src={img.url}
            alt={img.caption || 'Gallery'}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover hover:scale-105 transition duration-300"
          />
        </div>
      ))}
    </div>
  )
}