'use client'

import { useEffect } from 'react'

import { CART_STORAGE_KEY, useCart } from '@/providers/Cart'

export function ClearCartOnCheckoutSuccess() {
    const { clearCart } = useCart()

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        window.localStorage.removeItem(CART_STORAGE_KEY)
        clearCart()
    }, [clearCart])

    return null
}
