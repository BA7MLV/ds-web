import * as React from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = (variant = 'default', size = 'default', className = '') => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--apple-blue)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] duration-300 ease-apple'
  
  const variants = {
    default: 'bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] hover:bg-[color:var(--apple-btn-primary-bg-hover)] shadow-sm hover:shadow-md hover:-translate-y-0.5',
    secondary: 'bg-[color:var(--apple-btn-secondary-bg)] backdrop-blur-md text-[color:var(--apple-btn-secondary-text)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] hover:-translate-y-0.5',
    outline: 'border border-[color:var(--apple-line)] bg-transparent hover:bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-ink)] backdrop-blur-sm',
    ghost: 'hover:bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-ink)]',
    link: 'text-[color:var(--apple-blue)] underline-offset-4 hover:underline',
  }

  const sizes = {
    default: 'h-10 px-5 py-2',
    sm: 'h-8 rounded-full px-3 text-xs',
    lg: 'h-12 rounded-full px-8 text-base',
    icon: 'h-10 w-10',
  }

  return cn(baseStyles, variants[variant], sizes[size], className)
}

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={buttonVariants(variant, size, className)}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
