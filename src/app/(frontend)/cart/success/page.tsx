import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { ClearCartOnCheckoutSuccess } from '@/components/Cart/ClearCartOnCheckoutSuccess'
import { Button } from '@/components/ui/button'
import { fulfillCheckoutSessionById } from '@/lib/stripe/fulfillCheckoutSession'
import { isStripeConfigured } from '@/lib/stripe/client'

export const metadata: Metadata = {
  title: 'Checkout complete',
}

type Props = {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams

  if (!sessionId || !isStripeConfigured()) {
    redirect('/account/purchases')
  }

  const payload = await getPayload({ config })

  try {
    await fulfillCheckoutSessionById(payload, sessionId)
  } catch (error) {
    payload.logger.error(
      `Failed to fulfill checkout session ${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return (
    <>
      <ClearCartOnCheckoutSuccess />
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold text-primary">Payment successful</h1>
        <p className="mt-2 text-gray-500">Your resources are now available in your account.</p>
        <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/account/purchases">View purchases</Link>
        </Button>
      </div>
    </>
  )
}
