import type { Metadata } from 'next'

import type { Media, Page, Post, Resource, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Resource> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  // Bare page title — the root layout's title.template appends ' | MathEd'.
  // When there's no doc title we leave it undefined so the layout default applies.
  const pageTitle = doc?.meta?.title || undefined
  const ogTitle = doc?.meta?.title ? `${doc.meta.title} | MathEd` : 'MathEd'

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title: ogTitle,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title: pageTitle,
  }
}
