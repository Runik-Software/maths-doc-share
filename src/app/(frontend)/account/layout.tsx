import { AccountSidebar } from '@/components/AccountSidebar'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    const payload = await getPayload({ config })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (!user) {
        redirect('/auth/login?returnTo=/account/purchases')
    }

    return (
        <div className="flex gap-10 p-8">
            <AccountSidebar />
            <div className="flex-1">{children}</div>
        </div>
    )
}