import { beforeEach, describe, expect, it, vi } from 'vitest'

const stripeClient = {
  products: {
    create: vi.fn(),
    update: vi.fn(),
  },
  prices: {
    create: vi.fn(),
  },
}

vi.mock('../../src/lib/stripe/client', () => ({
  getStripeClient: () => stripeClient,
  isStripeConfigured: () => true,
}))

vi.mock('@/utilities/formatPrice', () => ({
  isFree: (price: number | string | null | undefined) => Number(price) === 0,
}))

import { syncResourceProduct } from '../../src/lib/stripe/syncResourceProduct'

describe('syncResourceProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stripeClient.products.create.mockResolvedValue({
      id: 'prod_123',
      default_price: 'price_123',
    })
  })

  it('persists Stripe IDs through the same request context when creating a product', async () => {
    const payloadUpdate = vi.fn().mockResolvedValue({})
    const req = {
      context: {},
      payload: {
        update: payloadUpdate,
        logger: {
          info: vi.fn(),
          error: vi.fn(),
        },
      },
    } as any

    await syncResourceProduct({
      doc: {
        id: 7,
        _status: 'published',
        title: 'Algebra Pack',
        price: 12.5,
        stripeProductId: null,
        stripePriceId: null,
      } as any,
      previousDoc: undefined,
      req,
    })

    expect(stripeClient.products.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Algebra Pack',
      }),
    )

    expect(payloadUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'resources',
        id: 7,
        req,
        context: expect.objectContaining({ skipStripeSync: true, disableRevalidate: true }),
        overrideAccess: true,
      }),
    )
  })
})
