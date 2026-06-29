'use client'

import { ArrowLeft, FileText, ShoppingCart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { checkoutCart } from '@/app/actions/checkoutCart'
import { Button } from '@/components/ui/button'
import { formatPrice, isFree } from '@/utilities/formatPrice'
import { useCart } from '@/providers/Cart'

export default function CartPage() {
  const router = useRouter()
  const { items, count, removeItem, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((sum, item) => sum + (isFree(item.price) ? 0 : item.price ?? 0), 0)

  const handleCheckout = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await checkoutCart(items.map((i) => i.resourceId))
      clearCart()
      router.push('/account/purchases')
    } catch (err) {
      // The action throws when the user isn't authenticated — send them to log in
      // and return to the cart so they can finish checkout.
      if (err instanceof Error && err.message === 'Not authenticated') {
        router.push('/auth/login?returnTo=/cart')
        return
      }
      setError('Something went wrong during checkout. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <Link
        href="/resources"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-emerald-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue browsing
      </Link>

      <h1 className="text-2xl font-bold text-primary">Your Cart</h1>
      <p className="mb-6 text-gray-500">
        {count === 0 ? 'Your cart is empty.' : `${count} resource${count === 1 ? '' : 's'} ready for checkout.`}
      </p>

      {count === 0 ? (
        <div className="rounded-xl border border-border p-10 text-center">
          <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="mb-4 text-gray-500">You haven&apos;t added any resources yet.</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/resources">Browse resources</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Items */}
          <div className="flex flex-1 flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.resourceId}
                className="flex items-center gap-4 rounded-xl border border-gray-200 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-50 text-blue-600">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FileText size={20} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {item.slug ? (
                    <Link
                      href={`/resources/${item.slug}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <h3 className="font-semibold text-primary">{item.title}</h3>
                  )}
                  <p className="text-sm text-gray-500">
                    {isFree(item.price) ? 'FREE' : formatPrice(item.price)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.resourceId)}
                  aria-label={`Remove ${item.title} from cart`}
                  className="shrink-0 rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="rounded-xl border border-border p-5">
              <h2 className="mb-4 text-base font-bold text-foreground">Order Summary</h2>
              <div className="flex items-center justify-between border-b border-border pb-3 text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-base font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{total <= 0 ? 'FREE' : formatPrice(total)}</span>
              </div>

              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? 'Processing…' : 'Checkout'}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Payment is skipped for now — resources are added straight to your account.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
