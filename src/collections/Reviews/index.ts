import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { populateReviewAuthor } from './hooks/populateReviewAuthor'
import {
  updateResourceRatingAfterChange,
  updateResourceRatingAfterDelete,
} from './hooks/updateResourceRating'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: {
    // Anyone can read reviews so they render on the public resource pages
    read: anyone,
    // Only logged-in users may leave a review (the writing flow itself is not built yet)
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'body',
    defaultColumns: ['resource', 'author', 'rating', 'verified', 'createdAt'],
    group: 'Marketplace',
  },
  fields: [
    {
      name: 'resource',
      type: 'relationship',
      relationTo: 'resources',
      required: true,
      index: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Star rating from 1 to 5.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Mark as a verified purchase from a mathematics educator.',
      },
    },
    // Populated via the `populateReviewAuthor` hook so the public query never needs to read
    // the access-locked `users` collection directly.
    {
      name: 'populatedAuthor',
      type: 'group',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        { name: 'id', type: 'text' },
        { name: 'name', type: 'text' },
        { name: 'picture', type: 'text' },
        { name: 'headline', type: 'text' },
      ],
    },
  ],
  hooks: {
    afterRead: [populateReviewAuthor],
    afterChange: [updateResourceRatingAfterChange],
    afterDelete: [updateResourceRatingAfterDelete],
  },
}
