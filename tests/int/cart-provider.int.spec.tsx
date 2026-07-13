import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getCartResourcesMock } = vi.hoisted(() => ({
  getCartResourcesMock: vi.fn(),
}))

vi.mock('@/app/actions/getCartResources', () => ({
  getCartResources: getCartResourcesMock,
}))

import { ClearCartOnCheckoutSuccess } from '@/components/Cart/ClearCartOnCheckoutSuccess'
import { CartProvider, useCart } from '@/providers/Cart'

function CartConsumer() {
  const { count, items } = useCart()

  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="title">{items[0]?.title ?? ''}</span>
      <span data-testid="price">{items[0]?.price ?? ''}</span>
    </div>
  )
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('CartProvider', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    localStorage.clear()
    getCartResourcesMock.mockReset()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('persists only resource ids and hydrates details from the API', async () => {
    localStorage.setItem(
      'cart:v1',
      JSON.stringify([{ resourceId: 42, title: 'Stale title', price: 1.23 }]),
    )

    getCartResourcesMock.mockResolvedValue([
      {
        resourceId: 42,
        title: 'Fresh title',
        price: 9.99,
        slug: 'fresh-title',
        image: null,
      },
    ])

    await act(async () => {
      root.render(
        <CartProvider>
          <CartConsumer />
        </CartProvider>,
      )
      await flushPromises()
    })

    expect(getCartResourcesMock).toHaveBeenCalledWith([42])
    expect(container.textContent).toContain('Fresh title')
    expect(container.textContent).toContain('9.99')
    expect(localStorage.getItem('cart:v1')).toBe('[42]')
  })

  it('clears the cart state and local storage after checkout succeeds', async () => {
    localStorage.setItem('cart:v1', JSON.stringify([42]))
    getCartResourcesMock.mockResolvedValue([])

    await act(async () => {
      root.render(
        <CartProvider>
          <ClearCartOnCheckoutSuccess />
          <CartConsumer />
        </CartProvider>,
      )
      await flushPromises()
    })

    expect(container.textContent).toContain('0')
    expect(localStorage.getItem('cart:v1')).toBe('[]')
  })
})
