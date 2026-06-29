'use client'

import Link from 'next/link'
import React from 'react'
import { ShoppingCart } from 'lucide-react'

import { useCart } from '@/providers/Cart'

export const CartButton: React.FC = () => {
  const { count } = useCart()

  return (
    <Link
      href="/cart"
      aria-label={`Cart${count > 0 ? `, ${count} item${count === 1 ? '' : 's'}` : ''}`}
      className="relative text-foreground transition-colors hover:text-emerald-600"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}
