import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span className={clsx('text-2xl font-extrabold tracking-tight', className)}>
      <span className="text-slate-900 dark:text-white">Math</span>
      <span className="text-emerald-600">Ed</span>
    </span>
  )
}
