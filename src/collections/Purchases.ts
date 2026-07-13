import type { CollectionConfig } from 'payload'

export const Purchases: CollectionConfig = {
  slug: 'purchases',
  admin: { useAsTitle: 'id' },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('Admin')) {
        return true
      }
      return { user: { equals: user.id } } // users can only see their own
    },
    create: ({ req: { user } }) => user?.roles?.includes('Admin') ?? false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'resource',
      type: 'relationship',
      relationTo: 'resources',
      required: true,
    },
    {
      name: 'purchasedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'completed',
      options: ['pending', 'completed', 'failed'],
    },
    {
      name: 'stripeCheckoutSessionId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Stripe Checkout Session that completed this purchase.',
      },
    },
  ],
}
