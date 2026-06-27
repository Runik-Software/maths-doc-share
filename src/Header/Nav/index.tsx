'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import type { Header as HeaderType } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { CMSLink } from '@/components/Link'

// Best-effort href resolution so we can highlight the active nav item.
const resolveHref = (link: NonNullable<HeaderType['navItems']>[number]['link']): string | null => {
  if (link.type === 'reference' && typeof link.reference?.value === 'object') {
    const slug = (link.reference.value as { slug?: string }).slug
    if (!slug) return null
    return link.reference.relationTo === 'pages' ? `/${slug}` : `/${link.reference.relationTo}/${slug}`
  }
  return link.url ?? null
}

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const pathname = usePathname()
  const navItems = data?.navItems || []

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {navItems.map(({ link }, i) => {
        const href = resolveHref(link)
        const active =
          !!href && (pathname === href || (href !== '/' && pathname.startsWith(href)))

        return (
          <CMSLink
            key={i}
            {...link}
            appearance="inline"
            className={cn(
              'border-b-2 pb-1 text-sm transition-colors',
              active
                ? 'border-emerald-600 font-medium text-emerald-600'
                : 'border-transparent text-foreground hover:text-emerald-600',
            )}
          />
        )
      })}
    </nav>
  )
}
