import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
      links?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
      links?: Page['hero']['links']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText, links }) => {
  return (
    <div className="container mt-16">
      <div className="max-w-3xl">
        {children || (richText && <RichText data={richText} enableGutter={false} />)}
        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
