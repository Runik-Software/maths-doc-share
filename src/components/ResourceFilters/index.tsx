'use client'

import { cn } from '@/utilities/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { BookOpen, ClipboardCheck, FileText, SlidersHorizontal, X, type LucideIcon } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '../ui/button'

export type FilterOption = {
  slug: string
  title: string
  icon?: ('fileText' | 'bookOpen' | 'clipboardCheck') | null
}

type Props = {
  subjects: FilterOption[]
  grades: FilterOption[]
  resourceTypes: FilterOption[]
}

const typeIcons: Record<string, LucideIcon> = {
  fileText: FileText,
  bookOpen: BookOpen,
  clipboardCheck: ClipboardCheck,
}

const parseList = (value: string | null): string[] =>
  value ? value.split(',').filter(Boolean) : []

export const ResourceFilters: React.FC<Props> = ({ subjects, grades, resourceTypes }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const selected = {
    subject: parseList(searchParams.get('subject')),
    grade: parseList(searchParams.get('grade')),
    type: parseList(searchParams.get('type')),
  }

  const activeCount = selected.subject.length + selected.grade.length + selected.type.length
  const hasActiveFilters = activeCount > 0

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const toggle = useCallback(
    (key: 'subject' | 'grade' | 'type', slug: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = parseList(params.get(key))
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug]

      if (next.length) params.set(key, next.join(','))
      else params.delete(key)

      // Any filter change resets to the first page
      params.delete('page')
      router.push(`/resources?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('subject')
    params.delete('grade')
    params.delete('type')
    params.delete('page')
    router.push(`/resources?${params.toString()}`)
  }, [router, searchParams])

  const panel = (
    <>
        {/* Subject */}
        <FilterSection title="Subject">
          <ul className="space-y-2.5">
            {subjects.map((subject) => {
              const checked = selected.subject.includes(subject.slug)
              return (
                <li key={subject.slug}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle('subject', subject.slug)}
                    />
                    <span className={cn(checked ? 'font-medium text-foreground' : 'text-foreground')}>
                      {subject.title}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </FilterSection>

        {/* Grade level */}
        <FilterSection title="Grade Level">
          <div className="grid grid-cols-2 gap-2">
            {grades.map((grade) => {
              const active = selected.grade.includes(grade.slug)
              return (
                <Button
                  key={grade.slug}
                  onClick={() => toggle('grade', grade.slug)}
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-sm transition-colors bg-card',
                    active
                      ? 'border-emerald-500 bg-emerald-50 font-medium text-emerald-700'
                      : 'border-border text-foreground hover:border-emerald-300',
                  )}
                  variant="outline"
                >
                  {grade.title}
                </Button>
              )
            })}
          </div>
        </FilterSection>

        {/* Resource type */}
        <FilterSection title="Resource Type" last>
          <ul className="space-y-1.5">
            {resourceTypes.map((type) => {
              const active = selected.type.includes(type.slug)
              const Icon = typeIcons[type.icon ?? 'fileText'] ?? FileText
              return (
                <li key={type.slug}>
                  <Button
                    onClick={() => toggle('type', type.slug)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors justify-start',
                      active
                        ? 'bg-emerald-50 font-medium text-emerald-700'
                        : 'text-foreground hover:bg-muted',
                    )}
                    variant="ghost"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {type.title}
                  </Button>
                </li>
              )
            })}
          </ul>
        </FilterSection>

        {hasActiveFilters && (
          <Button
            onClick={clearAll}
            className="mt-5 text-sm font-medium text-emerald-600 hover:underline"
            variant="ghost"
          >
            Clear all filters
          </Button>
        )}
    </>
  )

  return (
    <>
      {/* Mobile: toggle button that opens the filters in a slide-in drawer */}
      <div className="lg:hidden">
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="flex w-full items-center justify-center gap-2 rounded-lg border-border py-2.5 text-sm font-medium text-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold text-foreground">Filters</h2>
              <Button
                onClick={() => setOpen(false)}
                variant="ghost"
                aria-label="Close filters"
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>
            <div className="border-t border-border p-4">
              <Button
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Show results
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: filters shown inline in the page grid */}
      <aside className="hidden w-full lg:block">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-base font-bold text-foreground">Filters</h2>
            <p className="text-sm text-muted-foreground">Refine your search</p>
          </div>
          {panel}
        </div>
      </aside>
    </>
  )
}

const FilterSection: React.FC<{ title: string; last?: boolean; children: React.ReactNode }> = ({
  title,
  last,
  children,
}) => (
  <div className={cn(!last && 'mb-6')}>
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h3>
    {children}
  </div>
)
