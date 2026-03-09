import { cn } from './utils.js'

export const getLocaleSliderTrackClassName = ({ compact = false } = {}) =>
  cn(
    'relative isolate grid grid-cols-3 items-center overflow-hidden rounded-full',
    'border border-[color:var(--apple-line)] bg-[color:var(--apple-btn-secondary-bg)]',
    'backdrop-blur-xl backdrop-saturate-[180%] shadow-[var(--apple-shadow-sm)]',
    'before:pointer-events-none before:absolute before:inset-px before:rounded-full',
    'before:border before:border-[color:var(--apple-soft-line)] before:opacity-70',
    compact ? 'h-9 p-0.5' : 'h-10 p-0.5',
    'focus-within:ring-2 focus-within:ring-offset-2',
    'focus-within:ring-[rgba(29,29,31,0.2)] focus-within:ring-offset-[rgba(255,255,255,0.9)]',
    'dark:focus-within:ring-[rgba(255,255,255,0.3)] dark:focus-within:ring-offset-[rgba(0,0,0,0.9)]'
  )

export const getLocaleSliderThumbClassName = () =>
  cn(
    'absolute left-0.5 top-0.5 bottom-0.5 rounded-full',
    'border border-[color:var(--apple-soft-line)] bg-[color:var(--apple-surface-elevated)]',
    'shadow-[var(--apple-shadow-sm)]',
    'transform transition-transform duration-150 ease-out motion-reduce:transition-none'
  )

export const getLocaleSliderThumbStyle = (index, count = 3) => ({
  width: `calc((100% - 0.25rem) / ${count})`,
  transform: `translateX(${index * 100}%)`,
})

export const getLocaleSliderLabelClassName = ({ compact = false, checked = false } = {}) =>
  cn(
    'inline-flex h-full w-full items-center justify-center rounded-full px-2',
    'cursor-pointer select-none transition-colors duration-150 motion-reduce:transition-none',
    'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-inset',
    'peer-focus-visible:ring-[rgba(29,29,31,0.14)] dark:peer-focus-visible:ring-[rgba(255,255,255,0.2)]',
    compact ? 'text-[12px] font-semibold' : 'text-[13px] font-semibold',
    checked
      ? 'text-[color:var(--apple-ink)]'
      : 'text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink-secondary)]'
  )
