'use client'

import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

export const HeaderSearch: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = value.trim()
    if (trimmed) params.set('q', trimmed)
    else params.delete('q')
    params.delete('page')
    router.push(`/resources?${params.toString()}`)
  }

  return (
    <form onSubmit={onSubmit} className={className} role="search">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search math resources, topics, or grade levels..."
          className="h-10 w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-emerald-400 focus:bg-background"
          aria-label="Search resources"
        />
      </div>
    </form>
  )
}
