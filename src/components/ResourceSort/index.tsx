'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const SORT_OPTIONS = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
] as const

export const ResourceSort: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('sort') ?? 'relevant'

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'relevant') params.delete('sort')
    else params.set('sort', value)
    params.delete('page')
    router.push(`/resources?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm text-muted-foreground">Sort by:</span>
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
