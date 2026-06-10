import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { auth0Strategy } from '@/strategies/auth0'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => user?.roles?.includes('Admin') ?? false,
    // create: authenticated,
    // delete: authenticated,
    // read: authenticated,
    // update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [auth0Strategy],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      unique: true,
    },
    {
      name: 'picture',
      type: 'text',
    },
    {
      name: 'headline',
      type: 'text',
      admin: {
        description: 'Public credential/role shown on resources & reviews, e.g. "M.Ed." or "Math Specialist".',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short public tagline shown on the author card, e.g. "Top educator • 15+ years experience".',
      },
    },
    {
      name: 'auth0Sub',
      type: 'text',
      unique: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        {
          label: 'Admin',
          value: 'Admin',
        },
        {
          label: 'User',
          value: 'User',
        },
      ],
    },
  ],
  timestamps: true,
}
