'use client'

import { cn } from '@/utilities/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'
import { BookOpen, ClipboardCheck, FileText, type LucideIcon } from 'lucide-react'

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

  const selected = {
    subject: parseList(searchParams.get('subject')),
    grade: parseList(searchParams.get('grade')),
    type: parseList(searchParams.get('type')),
  }

  const hasActiveFilters =
    selected.subject.length > 0 || selected.grade.length > 0 || selected.type.length > 0

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

  return (
    <aside className="w-full">
      <div className="rounded-xl border border-border bg-card p-5">
        {/* Account panel header (presentational) */}
        <div className="mb-6 border-b border-border pb-4">
          <h2 className="text-base font-bold text-emerald-700">My Account</h2>
          <p className="text-sm text-muted-foreground">Manage your resources</p>
        </div>

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
      </div>
    </aside>
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
