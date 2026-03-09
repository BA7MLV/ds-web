import { cn } from './utils.js'

export const getRecommendedBadgeClassName = () =>
  cn(
    'absolute left-5 top-0 -translate-y-1/2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--apple-ink)]',
    'border border-[color:var(--apple-line-strong)] bg-[color:var(--apple-surface-elevated)] shadow-[var(--apple-shadow-sm)]'
  )
