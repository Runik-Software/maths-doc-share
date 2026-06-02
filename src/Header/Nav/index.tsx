'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { SessionData } from '@auth0/nextjs-auth0/types'

export const HeaderNav: React.FC<{ data: HeaderType; session: SessionData | null }> = ({
  data,
  session,
}) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
      {session ? (
        <div className="flex items-center gap-2">
          <span>{session.user.name}</span>
          <Link href="/auth/logout" className="ml-2">
            Logout
          </Link>
        </div>
      ) : (
        <Link href="/auth/login" className="ml-2">
          Login
        </Link>
      )}
    </nav>
  )
}
