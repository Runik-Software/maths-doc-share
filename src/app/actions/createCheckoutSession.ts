'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { createManagedPaymentsCheckoutSession } from '@/lib/stripe/createCheckoutSession'
import { isStripeConfigured } from '@/lib/stripe/client'
import { grantPurchases } from '@/lib/purchases/grantPurchases'

export type CheckoutResult = {
  success: boolean
  added: number
  alreadyOwned: number
  checkoutUrl?: string
}

export async function createCheckoutSession(resourceIds: number[]): Promise<CheckoutResult> {
  const payload = await getPayload({ config })
  const headers = await getHeaders()

  const { user } = await payload.auth({ headers })
  if (!user) throw new Error('Not authenticated')

  const uniqueIds = Array.from(new Set(resourceIds)).filter((id) => Number.isFinite(id))

  if (!isStripeConfigured()) {
    const result = await grantPurchases({
      payload,
      userId: user.id,
      resourceIds: uniqueIds,
    })
    return { success: true, ...result }
  }

  const result = await createManagedPaymentsCheckoutSession({
    payload,
    user,
    resourceIds: uniqueIds,
  })

  if (result.type === 'redirect') {
    return {
      success: true,
      added: 0,
      alreadyOwned: 0,
      checkoutUrl: result.url,
    }
  }

  return {
    success: true,
    added: result.added,
    alreadyOwned: result.alreadyOwned,
  }
}
