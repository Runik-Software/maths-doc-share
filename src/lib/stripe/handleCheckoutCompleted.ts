import type { StripeWebhookHandler } from '@payloadcms/plugin-stripe/types'
import type Stripe from 'stripe'

import { fulfillCheckoutSession } from './fulfillCheckoutSession'

export const handleCheckoutCompleted: StripeWebhookHandler = async ({ event, payload }) => {
  const checkoutEvent = event as Stripe.Event & {
    type: 'checkout.session.completed'
    data: { object: Stripe.Checkout.Session }
  }

  if (checkoutEvent.type !== 'checkout.session.completed') {
    return
  }

  await fulfillCheckoutSession({
    payload,
    session: checkoutEvent.data.object,
  })
}
