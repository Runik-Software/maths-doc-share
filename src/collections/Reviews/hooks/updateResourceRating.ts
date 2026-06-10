import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from 'payload'

const getResourceId = (resource: unknown): number | string | null => {
  if (!resource) return null
  return typeof resource === 'object'
    ? ((resource as { id: number | string }).id ?? null)
    : (resource as number | string)
}

// Recompute and persist the denormalised `averageRating` / `reviewCount` aggregates on a
// resource so the browse cards can show ratings without querying every review.
//
// `req` is threaded into every nested operation so they join the current transaction and
// reuse its connection — without this, the nested find/update each grab a fresh pool
// connection while the outer review write holds one, which can deadlock the pool.
const recalculate = async (req: PayloadRequest, resourceId: number | string | null) => {
  if (resourceId == null) return

  const { payload } = req

  const reviews = await payload.find({
    collection: 'reviews',
    depth: 0,
    limit: 0, // 0 = no limit, return all matching reviews
    pagination: false,
    req,
    where: {
      resource: {
        equals: resourceId,
      },
    },
  })

  const reviewCount = reviews.totalDocs
  const averageRating =
    reviewCount > 0
      ? Math.round(
          (reviews.docs.reduce((sum, review) => sum + (review.rating ?? 0), 0) / reviewCount) * 10,
        ) / 10
      : 0

  try {
    await payload.update({
      collection: 'resources',
      id: resourceId,
      data: {
        averageRating,
        reviewCount,
      },
      req,
      // Avoid triggering a revalidation round-trip for an automated aggregate update
      context: { disableRevalidate: true },
    })
  } catch {
    // swallow – the resource may have been deleted
  }
}

export const updateResourceRatingAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  await recalculate(req, getResourceId(doc?.resource))

  // If a review was moved to a different resource, refresh the previous one too.
  const prevResourceId = getResourceId(previousDoc?.resource)
  const currentResourceId = getResourceId(doc?.resource)
  if (prevResourceId != null && prevResourceId !== currentResourceId) {
    await recalculate(req, prevResourceId)
  }

  return doc
}

export const updateResourceRatingAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await recalculate(req, getResourceId(doc?.resource))
  return doc
}
