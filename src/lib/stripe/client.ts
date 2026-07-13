import Stripe from 'stripe'

import { STRIPE_API_VERSION } from './constants'

let stripeClient: Stripe | null = null

export const getStripeClient = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      // Preview API version required for Managed Payments (see blueprint).
      apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
    })
  }

  return stripeClient
}

export const isStripeConfigured = (): boolean => Boolean(process.env.STRIPE_SECRET_KEY)
