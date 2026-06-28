import { formatRelativeDate } from '@/utilities/formatRelativeDate'
import { PenLine } from 'lucide-react'
import React from 'react'

import type { Review } from '@/payload-types'

import { StarRating } from '@/components/StarRating'

const initials = (name?: string | null): string =>
  (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const ResourceReviews: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Teacher Reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified purchases from mathematics educators.
          </p>
        </div>
        {/* Presentational — the review-writing flow is not built yet */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-emerald-600 hover:underline"
        >
          <PenLine className="h-4 w-4" />
          Write a Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No reviews yet.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const author = review.populatedAuthor
            return (
              <article key={review.id} className="rounded-lg border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {author?.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={author.picture}
                        alt={author.name ?? 'Reviewer'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {initials(author?.name)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {[author?.name, author?.headline].filter(Boolean).join(', ') || 'Educator'}
                      </p>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeDate(review.createdAt)}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">{review.body}</p>
              </article>
            )
          })}

          <div className="pt-2 text-center">
            <button
              type="button"
              className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Load More Reviews
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
