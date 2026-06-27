import { cn } from '@/utilities/ui'
import React from 'react'

import { PostCard, CardPostData } from '@/components/PostCard'
import { CardReviewData, ReviewCard } from '../ReviewCard';

export type Doc = {
  type: 'posts';
  doc: CardPostData;
} | {
  type: 'reviews';
  doc: CardReviewData;
}

export type Props = {
  entries: Doc[];
}

export const CollectionArchive: React.FC<Props> = (props) => {

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {props.entries?.map(({ type, doc }, index) => {
            if (typeof doc === 'object' && doc !== null) {
              if (type === 'posts') {
                return (
                  <div className="col-span-4" key={index}>
                    <PostCard className="h-full" doc={doc} showCategories />
                  </div>
                )
              } else if (type === 'reviews') {
                return (
                  <div className="col-span-4" key={index}>
                    <ReviewCard className="h-full" doc={doc} showCategories />
                  </div>
                )
              }
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
