'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'

import { cn } from '@/utilities/ui'

type UserMenuProps = {
  name?: string | null
  email?: string | null
  picture?: string | null
}

// Build up to two initials from a name ("Ada Lovelace" -> "AL"), falling back
// to the first character of the email, then a generic "?".
const getInitials = (name?: string | null, email?: string | null): string => {
  const source = name?.trim() || email?.trim() || ''
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

export const UserMenu: React.FC<UserMenuProps> = ({ name, email, picture }) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const initials = getInitials(name, email)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className={cn(
          'flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-white transition-shadow hover:shadow-md',
          'ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
          open && 'ring-2 ring-emerald-500 ring-offset-2',
        )}
      >
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={picture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            {name && <p className="truncate text-sm font-semibold text-foreground">{name}</p>}
          </div>

          <div className="py-1">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <UserIcon className="h-4 w-4 shrink-0" />
              My Account
            </Link>
            <Link
              href="/auth/logout"
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log out
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
