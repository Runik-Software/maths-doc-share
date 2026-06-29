import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { PurchaseCard } from '@/components/PurchaseCard'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import type { Resource } from '@/payload-types'

export const metadata: Metadata = {
    title: 'Purchase History',
}

const ICON_COLORS = [
    'bg-blue-50 text-blue-600',
    'bg-emerald-50 text-emerald-600',
    'bg-amber-50 text-amber-600',
    'bg-violet-50 text-violet-600',
]

// Pull the current document id from a (depth-populated) resource.
const getDocumentId = (resource: Resource): number | null => {
    const doc = resource.document
    if (typeof doc === 'number') return doc
    if (doc && typeof doc === 'object') return doc.id
    return null
}

const getGradeTags = (resource: Resource): string[] =>
    (resource.grades ?? [])
        .filter((g): g is Exclude<typeof g, number> => typeof g === 'object' && g !== null)
        .map((g) => g.title)

export default async function PurchaseHistoryPage() {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) {
        redirect('/auth/login?returnTo=/account/purchases')
    }

    const purchases = await payload.find({
        collection: 'purchases',
        where: { user: { equals: user.id }, status: { equals: 'completed' } },
        depth: 0,
        sort: '-purchasedAt',
    })

    // Resolve the purchased resources directly (depth 1 to populate the current
    // document + grades). `document` isn't in the resource defaultPopulate, so
    // we can't rely on it being present via the relationship on the purchase.
    const resourceIds = purchases.docs
        .map((p) => (typeof p.resource === 'object' && p.resource ? p.resource.id : p.resource))
        .filter((v): v is number => typeof v === 'number')

    const resourcesById = new Map<number, Resource>()
    if (resourceIds.length > 0) {
        const resources = await payload.find({
            collection: 'resources',
            where: { id: { in: resourceIds } },
            depth: 1,
            pagination: false,
            select: { title: true, slug: true, grades: true, document: true },
        })
        for (const r of resources.docs) resourcesById.set(r.id, r as Resource)
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-primary">Purchase History</h1>
            <p className="text-gray-500 mb-6">Access and download your academic resources.</p>

            {purchases.docs.length === 0 ? (
                <p className="text-gray-400">No purchases yet.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {purchases.docs.map((purchase, i) => {
                        const resourceId =
                            typeof purchase.resource === 'object' && purchase.resource
                                ? purchase.resource.id
                                : purchase.resource
                        const resource =
                            typeof resourceId === 'number' ? resourcesById.get(resourceId) : undefined
                        // Skip purchases whose resource was deleted.
                        if (!resource) return null

                        const documentId = getDocumentId(resource)
                        if (documentId == null) return null

                        return (
                            <PurchaseCard
                                key={purchase.id}
                                id={String(documentId)}
                                title={resource.title}
                                orderedAt={purchase.purchasedAt}
                                orderNumber={String(purchase.id).slice(-4).toUpperCase()}
                                tags={getGradeTags(resource)}
                                iconColor={ICON_COLORS[i % ICON_COLORS.length]}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}
