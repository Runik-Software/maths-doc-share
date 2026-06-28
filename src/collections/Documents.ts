import type { CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { isAdmin } from '@/access/isAdmin'
import { authenticated } from '../access/authenticated'
import { NextResponse } from 'next/server'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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

      const purchases = await payload.find({
        collection: 'purchases',
        where: {
          and: [{ user: { equals: user.id } }, { status: { equals: 'completed' } }],
        },
        pagination: false,
      })

      const ownedIds = purchases.docs.map((p) =>
        typeof p.document === 'object' ? p.document.id : p.document,
      )

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

        // Check if the user has purchased the document
        const owns = await payload.find({
          collection: 'purchases',
          where: {
            and: [
              { user: { equals: user.id } },
              { document: { equals: id } },
              { status: { equals: 'completed' } },
            ],
          },
        })

        if (owns.totalDocs === 0) {
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

        const absoluteUrl =
          process.env.NODE_ENV === 'production'
            ? doc.url
            : `${process.env.NEXT_PUBLIC_SERVER_URL}${doc.url}`
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
