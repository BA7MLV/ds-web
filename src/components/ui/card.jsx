import * as React from 'react'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'glass-card rounded-[2rem] text-[color:var(--apple-ink)] transition-[transform,box-shadow,background-color,border-color] duration-500 ease-apple hover:-translate-y-1 hover:bg-[color:var(--apple-card-hover)] hover:[box-shadow:var(--apple-shadow-lg)] motion-reduce:transition-none motion-reduce:hover:transform-none',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

/* Padding rhythm: 24px outer frame, 16px between header and content, 6px inside the header. */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-6 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-lg font-semibold leading-snug tracking-tight text-[color:var(--apple-ink)]', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm leading-relaxed text-[color:var(--apple-muted)]', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-3 p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
