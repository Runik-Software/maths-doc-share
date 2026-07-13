import type { CollectionAfterChangeHook } from 'payload'

import type { Resource } from '@/payload-types'
import { isFree } from '@/utilities/formatPrice'

import { getStripeClient, isStripeConfigured } from './client'
import { DIGITAL_SCHOOL_TEXTBOOK_TAX_CODE, STRIPE_CURRENCY } from './constants'

const toUnitAmount = (price: number): number => Math.round(price * 100)

export const syncResourceProduct: CollectionAfterChangeHook<Resource> = async ({ doc, req }) => {
  if (req.context?.skipStripeSync || !isStripeConfigured()) {
    return doc
  }

  if (doc._status !== 'published') {
    req.payload.logger.info(`Resource ${doc.id} is not published. Skipping Stripe sync.`)
    return doc
  }

  const price = doc.price
  if (isFree(price)) {
    return doc
  }

  const stripe = getStripeClient()
  const unitAmount = toUnitAmount(price as number)

  try {
    if (doc.stripeProductId) {
      await stripe.products.update(doc.stripeProductId, {
        name: doc.title,
        tax_code: DIGITAL_SCHOOL_TEXTBOOK_TAX_CODE,
      })

      let currentAmount: number | null = null

      if (doc.stripePriceId) {
        try {
          const existingPrice = await stripe.prices.retrieve(doc.stripePriceId)
          currentAmount = existingPrice.unit_amount
        } catch {
          // price may have been deleted/archived out-of-band; treat as missing
          currentAmount = null
        }
      }

      const priceChanged = currentAmount !== unitAmount

      if (priceChanged) {
        const newPrice = await stripe.prices.create({
          product: doc.stripeProductId,
          unit_amount: unitAmount,
          currency: STRIPE_CURRENCY,
        })

        // Make the new price the default, and archive the old one so it can't
        // accidentally be used or clutter the dashboard
        await stripe.products.update(doc.stripeProductId, {
          default_price: newPrice.id,
        })

        if (doc.stripePriceId) {
          await stripe.prices.update(doc.stripePriceId, { active: false }).catch(() => {
            // non-fatal if this fails
          })
        }

        await req.payload.update({
          collection: 'resources',
          id: doc.id,
          data: { stripePriceId: newPrice.id },
          req,
          context: { skipStripeSync: true, disableRevalidate: true },
          overrideAccess: true,
        })
      }

      return doc
    }

    const product = await stripe.products.create({
      name: doc.title,
      tax_code: DIGITAL_SCHOOL_TEXTBOOK_TAX_CODE,
      default_price_data: {
        unit_amount: unitAmount,
        currency: STRIPE_CURRENCY,
      },
    })

    const defaultPrice =
      typeof product.default_price === 'string' ? product.default_price : product.default_price?.id

    await req.payload.update({
      collection: 'resources',
      id: doc.id,
      data: {
        stripeProductId: product.id,
        stripePriceId: defaultPrice ?? null,
      },
      req,
      context: { skipStripeSync: true, disableRevalidate: true },
      overrideAccess: true,
    })
  } catch (error) {
    req.payload.logger.error(
      `Failed to sync resource ${doc.id} to Stripe: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
