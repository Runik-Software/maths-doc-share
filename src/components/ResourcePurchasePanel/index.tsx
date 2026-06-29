import { formatPrice, isFree } from '@/utilities/formatPrice'
import { BadgeCheck, CheckCircle2, Download } from 'lucide-react'
import React from 'react'

import type { Resource } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/StarRating'
import { AuthorCard } from '@/components/AuthorCard'
import { AddToCartButton } from '@/components/AddToCartButton'

export const ResourcePurchasePanel: React.FC<{ resource: Resource; purchased?: boolean }> = ({
  resource,
  purchased,
}) => {
  const { title, grades, verified, price, averageRating, reviewCount, atAGlance, populatedAuthors } =
    resource

  const gradeLabels = (grades ?? [])
    .filter((g): g is Exclude<typeof g, number> => typeof g === 'object' && g !== null)
    .map((g) => g.title)

  const author = populatedAuthors?.[0]

  return (
    <div className="flex flex-col gap-5">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {gradeLabels.length > 0 && (
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Grade {gradeLabels.join(', ')}
          </span>
        )}
        {verified && (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verified Resource
          </span>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground">{title}</h1>
        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={averageRating} />
          <span className="text-sm text-muted-foreground">
            ({reviewCount ?? 0} Teacher Review{(reviewCount ?? 0) === 1 ? '' : 's'})
          </span>
        </div>
      </div>

      {/* Price */}
      {isFree(price) ? (
        <span className="text-3xl font-bold text-foreground">FREE</span>
      ) : (
        <span className="text-3xl font-bold text-foreground">{formatPrice(price)}</span>
      )}

      {/* Commerce actions */}
      <div className="flex flex-col gap-3">
        <AddToCartButton resource={resource} purchased={purchased} />
        <Button size="lg" variant="outline" className="w-full">
          <Download className="h-4 w-4" />
          Download Sample (PDF)
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Instant digital delivery + optional physical copy available
        </p>
      </div>

      {/* At a Glance */}
      {atAGlance && atAGlance.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">At a Glance</h2>
          <ul className="space-y-2.5">
            {atAGlance.map((item) => (
              <li key={item.id ?? item.text} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-foreground">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Author */}
      {author && <AuthorCard author={author} />}
    </div>
  )
}
