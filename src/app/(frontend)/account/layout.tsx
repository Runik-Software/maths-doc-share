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
        <div className="flex flex-col gap-6 p-4 md:flex-row md:gap-10 md:p-8">
            <AccountSidebar />
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    )
}