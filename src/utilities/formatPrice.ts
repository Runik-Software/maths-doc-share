// Centralised price formatting for resources. Returns "FREE" for empty / zero prices.
// Currency symbol is kept here so it can be changed in one place.
const CURRENCY = '£'

export const isFree = (price?: number | null): boolean => price == null || price <= 0

export const formatPrice = (price?: number | null): string => {
  if (isFree(price)) return 'FREE'
  return `${CURRENCY}${(price as number).toFixed(2)}`
}
