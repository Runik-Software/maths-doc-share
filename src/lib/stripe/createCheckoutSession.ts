import type Stripe from 'stripe'
import type { Payload } from 'payload'

import type { Resource, User } from '@/payload-types'
import { isFree } from '@/utilities/formatPrice'
import { getServerSideURL } from '@/utilities/getURL'
import { grantPurchases } from '@/lib/purchases/grantPurchases'

import { getStripeClient } from './client'

type CreateCheckoutSessionArgs = {
  payload: Payload
  user: User
  resourceIds: number[]
}

export type CreateCheckoutSessionResult =
  | { type: 'completed'; added: number; alreadyOwned: number }
  | { type: 'redirect'; url: string }

export async function createManagedPaymentsCheckoutSession({
  payload,
  user,
  resourceIds,
}: CreateCheckoutSessionArgs): Promise<CreateCheckoutSessionResult> {
  const stripe = getStripeClient()
  const uniqueIds = Array.from(new Set(resourceIds)).filter((id) => Number.isFinite(id))

  if (uniqueIds.length === 0) {
    return { type: 'completed', added: 0, alreadyOwned: 0 }
  }

  const resources = await payload.find({
    collection: 'resources',
    where: { id: { in: uniqueIds } },
    depth: 0,
    pagination: false,
  })

  const resourceById = new Map(resources.docs.map((r) => [r.id, r as Resource]))

  const purchasableIds = uniqueIds.filter((id) => resourceById.has(id))
  const freeIds: number[] = []
  const paidResources: Resource[] = []

  for (const id of purchasableIds) {
    const resource = resourceById.get(id)!
    if (isFree(resource.price)) {
      freeIds.push(id)
    } else {
      paidResources.push(resource)
    }
  }

  const freeGrant =
    freeIds.length > 0
      ? await grantPurchases({ payload, userId: user.id, resourceIds: freeIds })
      : { added: 0, alreadyOwned: 0 }

  if (paidResources.length === 0) {
    return {
      type: 'completed',
      added: freeGrant.added,
      alreadyOwned: freeGrant.alreadyOwned,
    }
  }

  const owned = await payload.find({
    collection: 'purchases',
    where: {
      and: [
        { user: { equals: user.id } },
        { resource: { in: paidResources.map((r) => r.id) } },
        { status: { equals: 'completed' } },
      ],
    },
    pagination: false,
  })

  const ownedResourceIds = new Set(
    owned.docs.map((p) => (typeof p.resource === 'number' ? p.resource : p.resource?.id)),
  )

  const unpaidResources = paidResources.filter((r) => !ownedResourceIds.has(r.id))

  if (unpaidResources.length === 0) {
    return {
      type: 'completed',
      added: freeGrant.added,
      alreadyOwned: freeGrant.alreadyOwned + paidResources.length,
    }
  }

  const missingPrice = unpaidResources.filter((r) => !r.stripePriceId)
  if (missingPrice.length > 0) {
    throw new Error(
      `Stripe price not configured for: ${missingPrice.map((r) => r.title).join(', ')}`,
    )
  }

  const baseUrl = getServerSideURL()
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = unpaidResources.map(
    (resource) => ({
      price: resource.stripePriceId!,
      quantity: 1,
    }),
  )

  const stripeCustomerId = user.stripeID ?? undefined

  const sessionParams = {
    mode: 'payment' as const,
    line_items: lineItems,
    automatic_tax: { enabled: true },
    success_url: `${baseUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart`,
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: user.email ?? undefined }),
    metadata: {
      userId: String(user.id),
      resourceIds: unpaidResources.map((r) => r.id).join(','),
    },
    billing_address_collection: 'required',
  } satisfies Stripe.Checkout.SessionCreateParams

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL')
  }

  return { type: 'redirect', url: session.url }
}
