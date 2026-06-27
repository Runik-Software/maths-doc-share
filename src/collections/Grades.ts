import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Grades: CollectionConfig = {
  slug: 'grades',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'band', 'order'],
    group: 'Taxonomy',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Key Stage 3", "GCSE", "A-Level".',
      },
    },
    {
      name: 'band',
      type: 'text',
      admin: {
        description: 'Optional grouping shown in breadcrumbs, e.g. "Secondary".',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Controls the order grades appear in filters (low to high).',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
