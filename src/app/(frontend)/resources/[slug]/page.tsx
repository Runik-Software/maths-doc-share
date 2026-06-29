import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode, headers as getHeaders } from 'next/headers'
import React, { cache } from 'react'

import type { Media, Resource, Review } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'

import { ResourceBreadcrumb } from '@/components/ResourceBreadcrumb'
import { ResourceGallery } from '@/components/ResourceGallery'
import { ResourcePurchasePanel } from '@/components/ResourcePurchasePanel'
import { LearningObjectives } from '@/components/LearningObjectives'
import { ResourceReviews } from '@/components/ResourceReviews'
import { RelatedResources } from '@/components/RelatedResources'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const resources = await payload.find({
    collection: 'resources',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return resources.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ResourcePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/resources/' + decodedSlug

  const resource = await queryResourceBySlug({ slug: decodedSlug })

  if (!resource) return <PayloadRedirects url={url} />

  const payload = await getPayload({ config: configPromise })

  // Has the current user already purchased this resource? Used to swap the
  // "Add to Cart" button for an owned state and prevent buying it twice.
  const { user } = await payload.auth({ headers: await getHeaders() })
  let purchased = false
  if (user) {
    const owned = await payload.find({
      collection: 'purchases',
      depth: 0,
      limit: 1,
      where: {
        and: [
          { user: { equals: user.id } },
          { resource: { equals: resource.id } },
          { status: { equals: 'completed' } },
        ],
      },
    })
    purchased = owned.totalDocs > 0
  }

  const reviewsResult = await payload.find({
    collection: 'reviews',
    depth: 0,
    limit: 50,
    overrideAccess: false,
    sort: '-createdAt',
    where: {
      resource: {
        equals: resource.id,
      },
    },
  })

  // Gallery = hero image first, then any additional gallery images (Media objects only)
  const images: Media[] = [
    resource.heroImage,
    ...(resource.gallery ?? []),
  ].filter((m): m is Media => typeof m === 'object' && m !== null)

  const relatedResources = (resource.relatedResources ?? []).filter(
    (r): r is Resource => typeof r === 'object' && r !== null,
  )

  const firstGrade = (resource.grades ?? []).find(
    (g): g is Exclude<typeof g, number> => typeof g === 'object' && g !== null,
  )
  const breadcrumbItems = [
    { label: 'Browse Resources', href: '/resources' },
    ...(firstGrade
      ? [
          {
            label: firstGrade.band || firstGrade.title,
            href: `/resources?grade=${firstGrade.slug}`,
          },
        ]
      : []),
    { label: resource.title },
  ]

  return (
    <div className="container py-8">
      {draft && <LivePreviewListener />}
      <PayloadRedirects disableNotFound url={url} />

      <ResourceBreadcrumb items={breadcrumbItems} />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <ResourceGallery images={images} title={resource.title} />
        <ResourcePurchasePanel resource={resource} purchased={purchased} />
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-12">
          <section>
            <h2 className="mb-5 text-2xl font-bold text-foreground">Description</h2>
            <RichText data={resource.content} enableGutter={false} enableProse />
          </section>

          <LearningObjectives objectives={resource.learningObjectives ?? []} />

          <ResourceReviews reviews={reviewsResult.docs as Review[]} />
        </div>

        <div>
          <RelatedResources resources={relatedResources} />
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const resource = await queryResourceBySlug({ slug: decodedSlug })

  return generateMeta({ doc: resource })
}

const queryResourceBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'resources',
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
