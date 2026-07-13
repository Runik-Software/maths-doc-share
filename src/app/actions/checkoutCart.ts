'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { grantPurchases } from '@/lib/purchases/grantPurchases'

export type CheckoutResult = {
  success: boolean
  added: number
  alreadyOwned: number
}

/** Grants free resources directly when Stripe is not configured. */
export async function checkoutCart(resourceIds: number[]): Promise<CheckoutResult> {
  const payload = await getPayload({ config })
  const headers = await getHeaders()

  const { user } = await payload.auth({ headers })
  if (!user) throw new Error('Not authenticated')

  const uniqueIds = Array.from(new Set(resourceIds)).filter((id) => Number.isFinite(id))
  const result = await grantPurchases({
    payload,
    userId: user.id,
    resourceIds: uniqueIds,
  })

  return { success: true, ...result }
}
