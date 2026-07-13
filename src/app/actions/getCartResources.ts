'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import type { Resource } from '@/payload-types'

export type CartResource = {
  resourceId: number
  title: string
  price?: number | null
  slug?: string | null
  image?: string | null
}

const getResourceImage = (heroImage: Resource['heroImage']): string | null => {
  if (heroImage && typeof heroImage === 'object' && heroImage !== null) {
    return heroImage.url ?? null
  }

  return null
}

export async function getCartResources(resourceIds: number[]): Promise<CartResource[]> {
  const payload = await getPayload({ config })
  const uniqueIds = Array.from(new Set(resourceIds)).filter((id) => Number.isInteger(id) && id > 0)

  if (uniqueIds.length === 0) {
    return []
  }

  const result = await payload.find({
    collection: 'resources',
    depth: 0,
    limit: uniqueIds.length,
    where: {
      id: {
        in: uniqueIds,
      },
    },
  })

  const docsById = new Map(result.docs.map((doc) => [doc.id as number, doc]))

  return uniqueIds
    .map((resourceId) => {
      const doc = docsById.get(resourceId)
      if (!doc) {
        return null
      }

      return {
        resourceId: doc.id as number,
        title: doc.title ?? 'Untitled resource',
        price: doc.price ?? null,
        slug: typeof doc.slug === 'string' ? doc.slug : null,
        image: getResourceImage(doc.heroImage),
      }
    })
    .filter((item): item is CartResource => item !== null)
}
