'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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
  addItem: (item: CartItem) => void
  removeItem: (resourceId: number) => void
  clearCart: () => void
}

const STORAGE_KEY = 'cart:v1'

const CartContext = createContext<CartContextValue | null>(null)

const readStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  // Track hydration so the first client render matches the server (empty cart),
  // avoiding a hydration mismatch on the cart count badge.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(readStorage())
    setHydrated(true)
  }, [])

  // Persist on change (after initial hydration) and keep other tabs in sync.
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota / serialization errors — the cart is non-critical.
    }
  }, [items, hydrated])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) =>
      prev.some((i) => i.resourceId === item.resourceId) ? prev : [...prev, item],
    )
  }, [])

  const removeItem = useCallback((resourceId: number) => {
    setItems((prev) => prev.filter((i) => i.resourceId !== resourceId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: hydrated ? items.length : 0,
      isInCart: (resourceId: number) => items.some((i) => i.resourceId === resourceId),
      addItem,
      removeItem,
      clearCart,
    }),
    [items, hydrated, addItem, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
