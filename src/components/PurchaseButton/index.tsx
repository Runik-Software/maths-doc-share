'use client'
import { purchaseDocument } from '@/app/actions/purchaseDocument'
import { Button } from '../ui/button'

export function PurchaseButton({ documentId }: { documentId: number }) {
  return (
    <Button onClick={() => purchaseDocument(documentId)}>
      Buy
    </Button>
  )
}