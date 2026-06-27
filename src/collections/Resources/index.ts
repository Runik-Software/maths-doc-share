import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidateResource } from './hooks/revalidateResource'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Resources: CollectionConfig<'resources'> = {
  slug: 'resources',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a resource is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'resources'>
  defaultPopulate: {
    title: true,
    slug: true,
    heroImage: true,
    price: true,
    verified: true,
    categories: true,
    subject: true,
    grades: true,
    resourceType: true,
    averageRating: true,
    reviewCount: true,
    populatedAuthors: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'resources',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'resources',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description: 'Additional preview images shown as thumbnails on the resource page.',
              },
            },
            {
              name: 'price',
              type: 'number',
              admin: {
                description: 'Leave blank or set to 0 to show the resource as FREE.',
              },
            },
            {
              name: 'Overview',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              admin: {
                description: 'This content should show an "at a glance" summary of the resource.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
            {
              name: 'atAGlance',
              type: 'array',
              labels: {
                singular: 'Highlight',
                plural: 'Highlights',
              },
              admin: {
                description: 'Short bullet highlights shown in the "At a Glance" panel.',
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'learningObjectives',
              type: 'array',
              admin: {
                description: 'Checklist of what students/teachers gain from this resource.',
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedResources',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'resources',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
            {
              name: 'subject',
              type: 'relationship',
              relationTo: 'subjects',
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'grades',
              type: 'relationship',
              relationTo: 'grades',
              hasMany: true,
              admin: {
                position: 'sidebar',
                description: 'Supports a range, e.g. Grade 9 + Grade 10.',
              },
            },
            {
              name: 'resourceType',
              type: 'relationship',
              relationTo: 'resource-types',
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'verified',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                position: 'sidebar',
                description: 'Show the "Verified Resource" badge.',
              },
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    {
      name: 'averageRating',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Automatically calculated from reviews.',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Automatically calculated from reviews.',
      },
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'picture',
          type: 'text',
        },
        {
          name: 'headline',
          type: 'text',
        },
        {
          name: 'bio',
          type: 'text',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateResource],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
