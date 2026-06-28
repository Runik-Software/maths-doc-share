import { cn } from '@/utilities/ui'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating?: number | null;     // 0–5, supports decimals like 2.5
  size?: number;        // icon size in px
  className?: string;
}

export function StarRating({
  rating = 0,
  size = 20,
  className,
}: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(5, rating ?? 0));

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
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
  );
}