import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const ResourceTypes: CollectionConfig = {
  slug: 'resource-types',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'icon', 'order'],
    group: 'Taxonomy',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Worksheets", "Lesson Plans", "Assessments".',
      },
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'fileText',
      options: [
        { label: 'File / Worksheet', value: 'fileText' },
        { label: 'Book / Lesson', value: 'bookOpen' },
        { label: 'Clipboard / Assessment', value: 'clipboardCheck' },
      ],
      admin: {
        description: 'Icon shown next to this type in the browse filters.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    slugField({
      position: undefined,
    }),
  ],
}
