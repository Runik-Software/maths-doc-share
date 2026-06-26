import { cn } from '@/utilities/ui'
import { Star } from 'lucide-react'
import React from 'react'

type Props = {
  rating?: number | null
  /** Optional review count rendered after the stars, e.g. "(124)". */
  reviewCount?: number | null
  /** Tailwind size classes for each star icon. */
  starClassName?: string
  className?: string
  /** Render the numeric rating before the stars (e.g. "4.9"). */
  showValue?: boolean
}

// Presentational star rating. Renders 5 stars, filling proportionally to `rating` (0–5)
// by clipping a gold star overlay so half/partial ratings display correctly.
export const StarRating: React.FC<Props> = ({
  rating,
  reviewCount,
  starClassName = 'w-4 h-4',
  className,
  showValue = false,
}) => {
  const value = Math.max(0, Math.min(5, rating ?? 0))
  const percent = (value / 5) * 100

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {showValue && <span className="text-sm font-semibold text-foreground">{value.toFixed(1)}</span>}
      <div className="relative inline-flex">
        {/* Empty stars */}
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(starClassName, 'text-amber-300')} />
          ))}
        </div>
        {/* Filled stars clipped to the rating percentage */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${percent}%` }}>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn(starClassName, 'fill-amber-400 text-amber-400')} />
            ))}
          </div>
        </div>
      </div>
      {typeof reviewCount === 'number' && (
        <span className="text-sm text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  )
}
