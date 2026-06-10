import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <Link className="inline-flex items-center" href="/">
            <Logo />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            © 2024 MathEd Marketplace. Academic precision for every classroom.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {navItems.map(({ link }, i) => (
              <CMSLink
                className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                key={i}
                {...link}
                appearance="inline"
              />
            ))}
          </nav>
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
