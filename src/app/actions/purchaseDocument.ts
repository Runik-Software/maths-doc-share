// app/actions/purchaseDocument.ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

export async function purchaseDocument(documentId: number) {
  const payload = await getPayload({ config })
  const headers = await getHeaders()

  const { user } = await payload.auth({ headers })
  if (!user) throw new Error('Not authenticated')

  // optional: avoid duplicate purchases
  const existing = await payload.find({
    collection: 'purchases',
    where: {
      and: [{ user: { equals: user.id } }, { document: { equals: documentId } }],
    },
  })

  if (existing.totalDocs > 0) {
    return { success: true, alreadyOwned: true }
  }

  await payload.create({
    collection: 'purchases',
    data: {
      user: user.id,
      document: documentId,
      status: 'completed', // pretend payment succeeded
    },
  })

  return { success: true }
}
