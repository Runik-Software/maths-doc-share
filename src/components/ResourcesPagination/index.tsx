'use client'

import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/utilities/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

// Builds a compact page list: always first & last, the current page, its neighbours,
// and ellipses for the gaps. e.g. 1 … 4 [5] 6 … 42
const buildPages = (page: number, totalPages: number): (number | 'ellipsis')[] => {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

export const ResourcesPagination: React.FC<{
  className?: string
  page: number
  totalPages: number
}> = ({ className, page, totalPages }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goTo = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return
    const params = new URLSearchParams(searchParams.toString())
    if (target === 1) params.delete('page')
    else params.set('page', String(target))
    router.push(`/resources?${params.toString()}`)
  }

  const hasPrev = page > 1
  const hasNext = page < totalPages
  const pages = buildPages(page, totalPages)

  return (
    <div className={cn('my-10', className)}>
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={!hasPrev} onClick={() => goTo(page - 1)} />
          </PaginationItem>

          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink isActive={p === page} onClick={() => goTo(p)}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext disabled={!hasNext} onClick={() => goTo(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
