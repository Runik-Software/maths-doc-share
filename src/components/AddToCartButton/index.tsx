'use client'

import { BadgeCheck, Check, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

import type { Resource } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/Cart'

// A resource is purchasable once it has an underlying document to deliver.
const hasDocument = (document: Resource['document']): boolean =>
  typeof document === 'number' || (typeof document === 'object' && document !== null)

const getImageUrl = (heroImage: Resource['heroImage']): string | null => {
  if (heroImage && typeof heroImage === 'object') return heroImage.url ?? null
  return null
}

export const AddToCartButton: React.FC<{ resource: Resource; purchased?: boolean }> = ({
  resource,
  purchased = false,
}) => {
  const router = useRouter()
  const { isInCart, addItem } = useCart()

  const inCart = isInCart(resource.id)

  if (!hasDocument(resource.document)) {
    return <p className="text-sm text-muted-foreground">Not available for purchase</p>
  }

  // Already owned — surface it and route to the user's resources instead of
  // letting them buy the same resource twice.
  if (purchased) {
    return (
      <Button
        size="lg"
        variant="outline"
        className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        onClick={() => router.push('/account/purchases')}
      >
        <BadgeCheck className="h-4 w-4" />
        Purchased — View in account
      </Button>
    )
  }

  if (inCart) {
    return (
      <Button
        size="lg"
        variant="outline"
        className="w-full border-primary text-primary hover:bg-primary hover:text-background"
        onClick={() => router.push('/cart')}
      >
        <Check className="h-4 w-4" />
        In Cart — View Cart
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full bg-primary text-primary-foreground hover:bg-emerald-700"
      onClick={() =>
        addItem({
          resourceId: resource.id,
          title: resource.title,
          price: resource.price,
          slug: resource.slug,
          image: getImageUrl(resource.heroImage),
        })
      }
    >
      <ShoppingCart className="h-4 w-4" />
      Add to Cart
    </Button>
  )
}
