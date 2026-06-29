import type { BasePayload, CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { isAdmin } from '@/access/isAdmin'
import { authenticated } from '../access/authenticated'
import { NextResponse } from 'next/server'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Resolve the set of document ids a user can access. Purchases reference a
// resource, and each resource points to its current document — so this always
// reflects the latest document, even after a resource's document is swapped.
const getOwnedDocumentIds = async (payload: BasePayload, userId: number | string): Promise<number[]> => {
  const purchases = await payload.find({
    collection: 'purchases',
    depth: 0,
    pagination: false,
    where: {
      and: [{ user: { equals: userId } }, { status: { equals: 'completed' } }],
    },
  })

  const resourceIds = purchases.docs
    .map((p) => (typeof p.resource === 'object' && p.resource ? p.resource.id : p.resource))
    .filter((v): v is number => typeof v === 'number')

  if (resourceIds.length === 0) return []

  const resources = await payload.find({
    collection: 'resources',
    depth: 0,
    pagination: false,
    where: { id: { in: resourceIds } },
    select: { document: true },
  })

  return resources.docs
    .map((r) => (typeof r.document === 'object' && r.document ? r.document.id : r.document))
    .filter((v): v is number => typeof v === 'number')
}

export const Document: CollectionConfig = {
  slug: 'documents',
  folders: true,
  defaultPopulate: {
    title: true,
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: async ({ req: { user, payload } }) => {
      if (!user) {
        return false
      }
      const isAdmin = Boolean(user?.roles?.includes('Admin'))
      if (isAdmin) {
        payload.logger.debug('User is admin, granting access to document')
        return true
      }

      // Ownership is tracked against resources, not documents, so a user always
      // has access to whatever document the resource currently points to.
      const ownedIds = await getOwnedDocumentIds(payload, user.id)

      if (ownedIds.length === 0) return false

      // Returning a query constraint means: "this user can read documents
      // WHERE id is in ownedIds" — Payload applies this automatically
      return { id: { in: ownedIds } }
    },
    update: authenticated,
  },
  endpoints: [
    {
      path: '/:id/download',
      method: 'get',
      handler: async ({ user, payload, routeParams, headers }) => {
        payload.logger.debug(
          { id: routeParams?.id, userId: user?.id },
          'Download request for document ID',
        )
        const id = routeParams?.id as string | undefined

        if (!id) {
          return Response.json({ error: 'Document ID is required' }, { status: 400 })
        }

        // Check if the user is authenticated
        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check the user owns a resource that currently points to this document.
        const ownedIds = await getOwnedDocumentIds(payload, user.id)

        if (!ownedIds.includes(Number(id))) {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Fetch the document
        const doc = await payload.findByID({ collection: 'documents', id })

        if (!doc) {
          return Response.json({ error: 'Document not found' }, { status: 404 })
        }

        if (!doc.url) {
          return Response.json({ error: 'Document has no URL' }, { status: 404 })
        }

        // const absoluteUrl =
        //   process.env.NODE_ENV === 'production'
        //     ? doc.url
        //     : `${process.env.NEXT_PUBLIC_SERVER_URL}${doc.url}`
        const absoluteUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}${doc.url}`
        payload.logger.debug({ url: doc.url, absoluteUrl }, 'Redirecting to document URL')

        const cookieHeader = headers.get('cookie')
        const blobRes = await fetch(absoluteUrl, {
          headers: cookieHeader ? { cookie: cookieHeader } : {},
        })
        if (!blobRes.ok) return NextResponse.json({ error: 'File not found' }, { status: 404 })

        const fileBuffer = await blobRes.arrayBuffer()

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': doc.mimeType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${doc.filename}"`,
            'Content-Length': String(fileBuffer.byteLength),
          },
        })
      },
    },
  ],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    disableLocalStorage: process.env.NODE_ENV === 'production',
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
}
