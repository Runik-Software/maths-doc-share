'use client'

import { cn } from '@/utilities/ui'
import { Heart } from 'lucide-react'
import React, { useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'

type Props = {
  images: MediaType[]
  title: string
}

export const ResourceGallery: React.FC<Props> = ({ images, title }) => {
  const [active, setActive] = useState(0)
  const [favourited, setFavourited] = useState(false)

  if (!images.length) {
    return <div className="aspect-square w-full rounded-xl bg-muted" />
  }

  const activeImage = images[active] ?? images[0]

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted">
        <Media fill imgClassName="object-cover" resource={activeImage} priority size="50vw" />

        <button
          type="button"
          aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={favourited}
          onClick={() => setFavourited((v) => !v)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition-colors hover:text-rose-500"
        >
          <Heart className={cn('h-5 w-5', favourited && 'fill-rose-500 text-rose-500')} />
        </button>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors',
                index === active ? 'border-emerald-500' : 'border-transparent hover:border-border',
              )}
              aria-label={`View image ${index + 1} of ${title}`}
            >
              <Media fill imgClassName="object-cover" resource={image} size="15vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
