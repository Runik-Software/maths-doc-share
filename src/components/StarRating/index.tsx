import { cn } from '@/utilities/ui'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating?: number | null;     // 0–5, supports decimals like 2.5
  size?: number;        // icon size in px
  reviewCount?: number | null;  // optional number of reviews to display
  showValue?: boolean;  // whether to show the numeric rating value
  className?: string;
}

export function StarRating({
  rating = 0,
  size = 20,
  reviewCount,
  showValue,
  className,
}: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(5, rating ?? 0));

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div
        className="inline-flex items-center gap-0.5"
        role="img"
        aria-label={`Rating: ${clampedRating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          // How "full" this particular star is, from 0 to 1
          const fillAmount = Math.max(0, Math.min(1, clampedRating - i));

          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              {/* Background (empty) star */}
              <Star size={size} className="absolute inset-0 text-muted-foreground/30" />

              {/* Filled star, clipped to the fill amount */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillAmount * 100}%` }}
              >
                <Star size={size} className="text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-foreground">
          {clampedRating.toFixed(1)}
        </span>
      )}

      {typeof reviewCount === "number" && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}