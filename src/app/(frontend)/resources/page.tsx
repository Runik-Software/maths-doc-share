import type { Metadata } from 'next/types'
import type { Where } from 'payload'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { ResourceArchive } from '@/components/ResourceArchive'
import { ResourceFilters, type FilterOption } from '@/components/ResourceFilters'
import { ResourceSort } from '@/components/ResourceSort'
import { ResourcesPagination } from '@/components/ResourcesPagination'

const LIMIT = 12

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

const list = (value: string | string[] | undefined): string[] => {
  const v = first(value)
  return v ? v.split(',').filter(Boolean) : []
}

const sortMap: Record<string, string> = {
  relevant: '-reviewCount',
  newest: '-publishedAt',
  'price-asc': 'price',
  'price-desc': '-price',
  rating: '-averageRating',
}

type Args = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResourcesPage({ searchParams: searchParamsPromise }: Args) {
  const searchParams = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const subjectSlugs = list(searchParams.subject)
  const gradeSlugs = list(searchParams.grade)
  const typeSlugs = list(searchParams.type)
  const query = first(searchParams.q)?.trim()
  const sort = sortMap[first(searchParams.sort) ?? 'relevant'] ?? sortMap.relevant
  const page = Math.max(1, Number(first(searchParams.page)) || 1)

  // Build the filter clause. Relationship fields are queried via the related doc's slug.
  const and: Where[] = []
  if (subjectSlugs.length) and.push({ 'subject.slug': { in: subjectSlugs } })
  if (gradeSlugs.length) and.push({ 'grades.slug': { in: gradeSlugs } })
  if (typeSlugs.length) and.push({ 'resourceType.slug': { in: typeSlugs } })
  if (query) {
    and.push({
      or: [{ title: { like: query } }, { 'meta.description': { like: query } }],
    })
  }
  const where: Where | undefined = and.length ? { and } : undefined

  const [resources, subjects, grades, resourceTypes] = await Promise.all([
    payload.find({
      collection: 'resources',
      depth: 1,
      limit: LIMIT,
      page,
      sort,
      overrideAccess: false,
      ...(where ? { where } : {}),
    }),
    payload.find({ collection: 'subjects', depth: 0, limit: 100, sort: 'title' }),
    payload.find({ collection: 'grades', depth: 0, limit: 100, sort: 'order' }),
    payload.find({ collection: 'resource-types', depth: 0, limit: 100, sort: 'order' }),
  ])

  const subjectOptions: FilterOption[] = subjects.docs.map((s) => ({ slug: s.slug, title: s.title }))
  const gradeOptions: FilterOption[] = grades.docs.map((g) => ({ slug: g.slug, title: g.title }))
  const typeOptions: FilterOption[] = resourceTypes.docs.map((t) => ({
    slug: t.slug,
    title: t.title,
    icon: t.icon,
  }))

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <ResourceFilters
          subjects={subjectOptions}
          grades={gradeOptions}
          resourceTypes={typeOptions}
        />

        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Browse All Resources</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {resources.totalDocs.toLocaleString()} expert-crafted math materials
              </p>
            </div>
            <ResourceSort />
          </div>

          {resources.docs.length > 0 ? (
            <ResourceArchive resources={resources.docs} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
              No resources match your filters. Try clearing some filters.
            </div>
          )}

          {resources.totalPages > 1 && resources.page && (
            <ResourcesPagination page={resources.page} totalPages={resources.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Browse Maths Resources | MathEd',
    description: 'Browse expert-crafted maths resources — filter by subject, grade and type.',
  }
}
