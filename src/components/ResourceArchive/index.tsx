import { cn } from '@/utilities/ui'
import React from 'react'

import type { Resource } from '@/payload-types'

import { ResourceCard } from '@/components/ResourceCard'

type Props = {
  resources: (Resource | number)[]
  className?: string
  purchasedResourceIds?: Array<number | string>
}

export const ResourceArchive: React.FC<Props> = ({
  resources,
  className,
  purchasedResourceIds = [],
}) => {
  const purchasedIds = new Set(purchasedResourceIds.map((id) => String(id)))

  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {resources?.map((doc, index) => {
        if (typeof doc !== 'object' || doc === null) return null
        const purchased = purchasedIds.has(String(doc.id))
        return <ResourceCard key={doc.id ?? index} doc={doc} purchased={purchased} />
      })}
    </div>
  )
}
