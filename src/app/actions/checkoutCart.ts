// app/actions/checkoutCart.ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

export type CheckoutResult = {
  success: boolean
  added: number
  alreadyOwned: number
}

// Adds the given resources to the user's account by creating `purchases`.
// Purchases reference the resource (not its document) so the user always gets
// the latest document the resource points to. Payment is skipped for now.
export async function checkoutCart(resourceIds: number[]): Promise<CheckoutResult> {
  const payload = await getPayload({ config })
  const headers = await getHeaders()

  const { user } = await payload.auth({ headers })
  if (!user) throw new Error('Not authenticated')

  // De-dupe ids coming from the client.
  const uniqueIds = Array.from(new Set(resourceIds)).filter((id) => Number.isFinite(id))

  let added = 0
  let alreadyOwned = 0

  for (const resourceId of uniqueIds) {
    const existing = await payload.find({
      collection: 'purchases',
      where: {
        and: [{ user: { equals: user.id } }, { resource: { equals: resourceId } }],
      },
    })

    if (existing.totalDocs > 0) {
      alreadyOwned++
      continue
    }

    await payload.create({
      collection: 'purchases',
      data: {
        user: user.id,
        resource: resourceId,
        status: 'completed', // pretend payment succeeded
      },
    })
    added++
  }

  return { success: true, added, alreadyOwned }
}
