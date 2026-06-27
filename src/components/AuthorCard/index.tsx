import { cn } from '@/utilities/ui'
import React from 'react'

export type AuthorInfo = {
  name?: string | null
  picture?: string | null
  headline?: string | null
  bio?: string | null
}

const initials = (name?: string | null): string =>
  (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const AuthorCard: React.FC<{ author: AuthorInfo; className?: string }> = ({
  author,
  className,
}) => {
  const displayName = [author.name, author.headline].filter(Boolean).join(', ')

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-border p-3', className)}>
      {author.picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={author.picture}
          alt={author.name ?? 'Author'}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
          {initials(author.name)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{displayName || 'Author'}</p>
        {author.bio && <p className="truncate text-xs text-muted-foreground">{author.bio}</p>}
      </div>
    </div>
  )
}
