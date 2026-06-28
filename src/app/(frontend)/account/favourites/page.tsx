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

export default async function FavouritesPage() {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) {
        redirect('/auth/login?returnTo=/account/purchases')
    }


    return (
        <div>
            <h1 className="text-2xl font-bold text-primary">Favourites</h1>
            <p className="text-gray-500 mb-6">Your saved academic resources.</p>

            <p className="text-gray-400">Still under construction. This page will eventually display your favourite resources.</p>
        </div>
    )
}