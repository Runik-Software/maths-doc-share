import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}))

vi.mock('@/components/Media', () => ({
    Media: () => <div data-testid="media" />,
}))

vi.mock('@/components/StarRating', () => ({
    StarRating: () => <div data-testid="rating" />,
}))

vi.mock('@/utilities/useClickableCard', () => ({
    default: () => ({ card: { ref: undefined }, link: { ref: undefined } }),
}))

import { ResourceCard } from '@/components/ResourceCard'

describe('ResourceCard', () => {
    it('shows a purchased badge when the current user already owns the resource', () => {
        const resource = {
            id: 42,
            slug: 'sample-resource',
            title: 'Sample Resource',
            price: 12.5,
            averageRating: 4.5,
            reviewCount: 3,
            populatedAuthors: [{ name: 'Ada Lovelace' }],
            grades: [{ title: 'Year 7' }],
        }

        render(<ResourceCard doc={resource as any} purchased />)

        expect(screen.getByText('Purchased')).toBeTruthy()
    })
})
