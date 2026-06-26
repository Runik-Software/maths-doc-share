// Human-friendly relative time, e.g. "2 weeks ago", "1 month ago".
export const formatRelativeDate = (timestamp?: string | null): string => {
  if (!timestamp) return ''
  const then = new Date(timestamp).getTime()
  const diffSeconds = Math.max(0, Math.floor((Date.now() - then) / 1000))

  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ]

  let value = diffSeconds
  let unit = 'second'
  for (const [size, name] of units) {
    if (value < size) {
      unit = name
      break
    }
    value = Math.floor(value / size)
    unit = name
  }

  if (unit === 'second') return 'just now'
  const rounded = Math.max(1, Math.floor(value))
  return `${rounded} ${unit}${rounded === 1 ? '' : 's'} ago`
}
