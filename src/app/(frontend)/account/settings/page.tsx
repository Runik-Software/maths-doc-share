import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { PurchaseCard } from '@/components/PurchaseCard'
import { redirect } from 'next/navigation'


export default async function AccountSettingsPage() {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) {
        redirect('/auth/login?returnTo=/account/settings')
    }


    return (
        <div>
            <h1 className="text-2xl font-bold text-primary">Account Settings</h1>
            <p className="text-gray-500 mb-6">Manage your account preferences.</p>

            <p className="text-gray-400">Still under construction. This page will eventually display your account settings.</p>
        </div>
    )
}