'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post, Review } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardReviewData = Pick<Review, 'author' | 'body' | 'resource'>

export const ReviewCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardReviewData
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, showCategories, title: titleFromProps } = props

  const { author, body } = doc || {}


  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card',
        className,
      )}
      ref={card.ref}
    >
      <div className="p-4">
        <div className="prose">
          <h3>
            {typeof author === 'object' && author !== null ? (
              <span>{author.name}</span>
            ) : (
              <span>Anonymous</span>
            )}

          </h3>
        </div>
        {body && <div className="mt-2">{body}</div>}
      </div>
    </article>
  )
}
