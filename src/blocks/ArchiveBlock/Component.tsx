import type { Post, ArchiveBlock as ArchiveBlockProps, Review } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive, Doc } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs, relationTo } = props

  const limit = limitFromProps || 3

  let entries: Doc[] = []

  if (populateBy === 'collection') {
    if (!relationTo) {
      throw new Error('relationTo is required when populateBy is "collection"')
    }

    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedDocs = await payload.find({
      collection: relationTo,
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
          where: {
            categories: {
              in: flattenedCategories,
            },
          },
        }
        : {}),
    })

    entries = fetchedDocs.docs.map((doc) => ({ type: relationTo, doc } as Doc))

  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') { return { doc: post.value, type: post.relationTo } }
      }) as Doc[]

      entries = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive entries={entries} />
    </div>
  )
}
