import type { CollectionAfterReadHook } from 'payload'
import type { User } from '@/payload-types'

// The `users` collection has access control locked so users are not publicly accessible.
// As with the `populatedAuthors` pattern on posts/resources, we copy the small set of
// display fields we need into a `populatedAuthor` group so the public review query never
// has to read the protected user document directly.
export const populateReviewAuthor: CollectionAfterReadHook = async ({ doc, req }) => {
  if (doc?.author) {
    try {
      const authorDoc: User = await req.payload.findByID({
        id: typeof doc.author === 'object' ? doc.author?.id : doc.author,
        collection: 'users',
        depth: 0,
        req,
      })

      if (authorDoc) {
        doc.populatedAuthor = {
          id: authorDoc.id,
          name: authorDoc.name,
          picture: authorDoc.picture,
          headline: authorDoc.headline,
        }
      }
    } catch {
      // swallow error – author may have been deleted
    }
  }

  return doc
}
