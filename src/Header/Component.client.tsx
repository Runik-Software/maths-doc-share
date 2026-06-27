'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ShoppingCart, User as UserIcon } from 'lucide-react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { HeaderSearch } from './Search'
import { SessionData } from '@auth0/nextjs-auth0/types'

interface HeaderClientProps {
  data: Header
  session: SessionData | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, session }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="sticky top-0 z-20 w-full border-b bg-background"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container flex items-center gap-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Logo />
          </Link>
          <HeaderNav data={data} />
        </div>

        <div className="hidden flex-1 justify-center px-4 lg:flex">
          <HeaderSearch className="w-full max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Cart — presentational at this stage */}
          <button
            type="button"
            aria-label="Cart"
            className="text-foreground transition-colors hover:text-emerald-600"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>

          {session ? (
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-foreground" />
              <span className="hidden text-sm sm:inline">{session.user.name}</span>
              <Link
                href="/auth/logout"
                className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
              >
                Logout
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-emerald-600"
            >
              <UserIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
