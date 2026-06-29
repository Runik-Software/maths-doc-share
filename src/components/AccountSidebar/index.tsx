// app/account/AccountSidebar.tsx
'use client'

import { FileText, Heart, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { label: 'Purchase History', href: '/account/purchases', icon: FileText },
    { label: 'Favourites', href: '/account/favourites', icon: Heart },
    { label: 'Account Settings', href: '/account/settings', icon: Settings },
]

export function AccountSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-full shrink-0 md:w-56">
            <h2 className="text-lg font-semibold text-primary">My Account</h2>
            <p className="text-sm text-gray-500 mb-4">Manage your resources</p>

            <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:shrink ${active
                                ? 'bg-emerald-50 text-primary'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}