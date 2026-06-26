'use client'

import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import { formatPrice, isFree } from '@/utilities/formatPrice'
import Link from 'next/link'
import React, { useState } from 'react'
import { Heart } from 'lucide-react'

import type { Resource } from '@/payload-types'

import { Media } from '@/components/Media'
import { StarRating } from '@/components/StarRating'

export const ResourceCard: React.FC<{
  className?: string
  doc?: Resource
}> = ({ className, doc }) => {
  const { card, link } = useClickableCard({})
  const [favourited, setFavourited] = useState(false)

  if (!doc) return null

  const { slug, title, heroImage, grades, price, averageRating, reviewCount, populatedAuthors } =
    doc

  const href = `/resources/${slug}`
  const free = isFree(price)
  const firstGrade = Array.isArray(grades)
    ? grades.find((g) => typeof g === 'object' && g !== null)
    : undefined
  const gradeLabel = typeof firstGrade === 'object' ? firstGrade?.title : undefined
  const authorName = populatedAuthors?.[0]?.name

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {heroImage && typeof heroImage === 'object' && (
          <Media fill imgClassName="object-cover" resource={heroImage} size="33vw" />
        )}

        {gradeLabel && (
          <span className="absolute bottom-3 left-3 rounded-md bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white">
            {gradeLabel}
          </span>
        )}

        <button
          type="button"
          aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={favourited}
          onClick={(e) => {
            // Presentational only — no wishlist persistence yet. Stop the card link firing.
            e.preventDefault()
            e.stopPropagation()
            setFavourited((v) => !v)
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition-colors hover:text-rose-500"
        >
          <Heart className={cn('h-4 w-4', favourited && 'fill-rose-500 text-rose-500')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold leading-snug text-foreground">
          <Link className="line-clamp-2 after:absolute" href={href} ref={link.ref}>
            {title}
          </Link>
        </h3>

        {authorName && <p className="text-sm text-muted-foreground">By {authorName}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <StarRating rating={averageRating} reviewCount={reviewCount} showValue />

          {free ? (
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-sm font-bold text-emerald-700">
              FREE
            </span>
          ) : (
            <span className="text-lg font-bold text-emerald-600">{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </article>
  )
}
