import { cn } from '@/utilities/ui'
import { formatPrice } from '@/utilities/formatPrice'
import Link from 'next/link'
import React from 'react'

import type { Resource } from '@/payload-types'

import { Media } from '@/components/Media'
import { StarRating } from '@/components/StarRating'

export const RelatedResources: React.FC<{ resources: Resource[]; className?: string }> = ({
  resources,
  className,
}) => {
  if (!resources?.length) return null

  return (
    <div className={cn('rounded-xl border border-border p-5', className)}>
      <h2 className="mb-4 text-base font-bold text-foreground">Related Resources</h2>
      <ul className="space-y-4">
        {resources.map((resource) => (
          <li key={resource.id}>
            <Link
              href={`/resources/${resource.slug}`}
              className="group flex items-center gap-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {resource.heroImage && typeof resource.heroImage === 'object' && (
                  <Media fill imgClassName="object-cover" resource={resource.heroImage} size="56px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-emerald-600">
                  {resource.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatPrice(resource.price)}
                  </span>
                  {(resource.reviewCount ?? 0) > 0 && (
                    <StarRating rating={resource.averageRating} starClassName="w-3 h-3" />
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
