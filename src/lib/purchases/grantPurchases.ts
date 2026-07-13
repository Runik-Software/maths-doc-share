import type { Payload } from 'payload'

export type GrantPurchasesResult = {
  added: number
  alreadyOwned: number
}

type GrantPurchasesArgs = {
  payload: Payload
  userId: number
  resourceIds: number[]
  status?: 'pending' | 'completed' | 'failed'
  stripeCheckoutSessionId?: string
}

export async function grantPurchases({
  payload,
  userId,
  resourceIds,
  status = 'completed',
  stripeCheckoutSessionId,
}: GrantPurchasesArgs): Promise<GrantPurchasesResult> {
  const uniqueIds = Array.from(new Set(resourceIds)).filter((id) => Number.isFinite(id))

  let added = 0
  let alreadyOwned = 0

  for (const resourceId of uniqueIds) {
    const existing = await payload.find({
      collection: 'purchases',
      where: {
        and: [
          { user: { equals: userId } },
          { resource: { equals: resourceId } },
          { status: { equals: 'completed' } },
        ],
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      alreadyOwned++
      continue
    }

    await payload.create({
      collection: 'purchases',
      data: {
        user: userId,
        resource: resourceId,
        status,
        ...(stripeCheckoutSessionId ? { stripeCheckoutSessionId } : {}),
      },
      overrideAccess: true,
    })
    added++
  }

  return { added, alreadyOwned }
}
