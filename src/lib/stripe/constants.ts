/** Stripe API version required for Managed Payments (see blueprint). */
export const STRIPE_API_VERSION = '2026-02-25.preview' as const

/** Tax code for digital goods eligible for Managed Payments. */
export const DIGITAL_GOODS_TAX_CODE = 'txcd_10103100'

export const DIGITAL_SCHOOL_TEXTBOOK_TAX_CODE = 'txcd_10305001'

/** Matches display currency in formatPrice (£). */
export const STRIPE_CURRENCY = 'gbp'
