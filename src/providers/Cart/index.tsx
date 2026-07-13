'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { getCartResources } from '@/app/actions/getCartResources'

export type CartItem = {
  /** Resource id — the cart is keyed on this and it's what gets purchased. */
  resourceId: number
  title: string
  price?: number | null
  slug?: string | null
  image?: string | null
}

type CartContextValue = {
  items: CartItem[]
  count: number
  isInCart: (resourceId: number) => boolean
  addItem: (resourceId: number) => void
  removeItem: (resourceId: number) => void
  clearCart: () => void
}

export const CART_STORAGE_KEY = 'cart:v1'

const CartContext = createContext<CartContextValue | null>(null)

const readStorage = (): number[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return Array.from(
      new Set(
        parsed.reduce<number[]>((resourceIds, entry) => {
          if (typeof entry === 'number' && Number.isInteger(entry) && entry > 0) {
            resourceIds.push(entry)
            return resourceIds
          }

          if (entry && typeof entry === 'object' && 'resourceId' in entry) {
            const maybeId = Number((entry as { resourceId?: unknown }).resourceId)
            if (Number.isInteger(maybeId) && maybeId > 0) {
              resourceIds.push(maybeId)
            }
          }

          return resourceIds
        }, []),
      ),
    )
  } catch {
    return []
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resourceIds, setResourceIds] = useState<number[]>([])
  const [items, setItems] = useState<CartItem[]>([])
  // Track hydration so the first client render matches the server (empty cart),
  // avoiding a hydration mismatch on the cart count badge.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setResourceIds(readStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(resourceIds))
    } catch {
      // Ignore quota / serialization errors — the cart is non-critical.
    }
  }, [resourceIds, hydrated])

  useEffect(() => {
    if (!hydrated) return

    if (resourceIds.length === 0) {
      setItems([])
      return
    }

    let isMounted = true

    void getCartResources(resourceIds).then((hydratedItems) => {
      if (isMounted) {
        setItems(hydratedItems)
      }
    })

    return () => {
      isMounted = false
    }
  }, [hydrated, resourceIds])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setResourceIds(readStorage())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback((resourceId: number) => {
    setResourceIds((prev) => (prev.includes(resourceId) ? prev : [...prev, resourceId]))
  }, [])

  const removeItem = useCallback((resourceId: number) => {
    setResourceIds((prev) => prev.filter((id) => id !== resourceId))
  }, [])

  const clearCart = useCallback(() => {
    setResourceIds([])
    setItems([])
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: hydrated ? resourceIds.length : 0,
      isInCart: (resourceId: number) => resourceIds.includes(resourceId),
      addItem,
      removeItem,
      clearCart,
    }),
    [items, resourceIds, hydrated, addItem, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
