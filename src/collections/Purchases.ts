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
    create: ({ req: { user } }) => !!user, // tighten later when payment is added
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
      name: 'document',
      type: 'relationship',
      relationTo: 'documents',
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
      defaultValue: 'completed', // when you add real payments: 'pending' | 'completed' | 'failed'
      options: ['pending', 'completed', 'failed'],
    },
  ],
}
