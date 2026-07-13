import type Stripe from 'stripe'
import type { Payload } from 'payload'

import { grantPurchases } from '@/lib/purchases/grantPurchases'

import { getStripeClient } from './client'

const parseResourceIds = (metadata: Stripe.Metadata | null): number[] => {
  const raw = metadata?.resourceIds
  if (!raw) return []
  return raw
    .split(',')
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isFinite(id))
}

const parseUserId = (metadata: Stripe.Metadata | null): number | null => {
  const raw = metadata?.userId
  if (!raw) return null
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

type FulfillCheckoutSessionArgs = {
  payload: Payload
  session: Stripe.Checkout.Session
}

export async function fulfillCheckoutSession({
  payload,
  session,
}: FulfillCheckoutSessionArgs): Promise<void> {
  if (session.payment_status !== 'paid') {
    return
  }

  const userId = parseUserId(session.metadata)
  const resourceIds = parseResourceIds(session.metadata)

  if (!userId || resourceIds.length === 0) {
    payload.logger.warn(
      `Checkout session ${session.id} is missing userId or resourceIds in metadata`,
    )
    return
  }

  await grantPurchases({
    payload,
    userId,
    resourceIds,
    status: 'completed',
    stripeCheckoutSessionId: session.id,
  })
}

export async function fulfillCheckoutSessionById(
  payload: Payload,
  sessionId: string,
): Promise<void> {
  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  await fulfillCheckoutSession({ payload, session })
}
