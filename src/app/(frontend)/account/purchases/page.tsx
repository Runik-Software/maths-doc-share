import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { PurchaseCard } from '@/components/PurchaseCard'
import { redirect } from 'next/navigation'

const ICON_COLORS = [
    'bg-blue-50 text-blue-600',
    'bg-emerald-50 text-emerald-600',
    'bg-amber-50 text-amber-600',
    'bg-violet-50 text-violet-600',
]

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
        depth: 1,
        sort: '-purchasedAt',
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-primary">Purchase History</h1>
            <p className="text-gray-500 mb-6">Access and download your academic resources.</p>

            {purchases.docs.length === 0 ? (
                <p className="text-gray-400">No purchases yet.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {purchases.docs.map((purchase, i) => {
                        const doc = purchase.document as any
                        return (
                            <PurchaseCard
                                key={purchase.id}
                                id={doc.id}
                                title={doc.title}
                                orderedAt={purchase.purchasedAt}
                                orderNumber={String(purchase.id).slice(-4).toUpperCase()}
                                tags={[doc.grade, doc.format].filter(Boolean)}
                                iconColor={ICON_COLORS[i % ICON_COLORS.length]}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}