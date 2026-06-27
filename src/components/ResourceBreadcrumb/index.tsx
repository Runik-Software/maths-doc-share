import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, { Fragment } from 'react'

type Crumb = { label: string; href?: string }

export const ResourceBreadcrumb: React.FC<{ items: Crumb[] }> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <Fragment key={index}>
            {item.href && !isLast ? (
              <Link href={item.href} className="text-muted-foreground hover:text-emerald-600">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </Fragment>
        )
      })}
    </nav>
  )
}
