import * as React from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = (variant = 'default', size = 'default', className = '', rounded = 'full') => {
  const baseStyles =
    'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-300 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--apple-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--apple-surface)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] active:duration-150 motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none'

  const variants = {
    default:
      'bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] [box-shadow:var(--apple-shadow-sm)] hover:bg-[color:var(--apple-btn-primary-bg-hover)] hover:-translate-y-px hover:[box-shadow:var(--apple-shadow-md)] active:translate-y-0 active:[box-shadow:var(--apple-shadow-sm)]',
    secondary:
      'border border-[color:var(--apple-btn-secondary-border)] bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-btn-secondary-text)] backdrop-blur-md hover:bg-[color:var(--apple-btn-secondary-bg-hover)] hover:-translate-y-px active:translate-y-0',
    outline:
      'border border-[color:var(--apple-line)] bg-transparent text-[color:var(--apple-ink)] backdrop-blur-sm hover:border-[color:var(--apple-line-strong)] hover:bg-[color:var(--apple-btn-secondary-bg)] active:bg-[color:var(--apple-btn-secondary-bg-hover)]',
    ghost:
      'text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-btn-secondary-bg)] active:bg-[color:var(--apple-btn-secondary-bg-hover)]',
    link: 'text-[color:var(--apple-blue)] underline-offset-4 hover:underline active:opacity-80',
  }

  const sizes = {
    default: 'h-10 px-5',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  }

  /* Pill by default; `soft` maps to the shared 12px radius token (--radius: 0.75rem). */
  const radii = {
    full: 'rounded-full',
    soft: 'rounded-[var(--radius)]',
  }

  return cn(baseStyles, variants[variant], sizes[size], radii[rounded] ?? radii.full, className)
}

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', rounded = 'full', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants(variant, size, className, rounded)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
