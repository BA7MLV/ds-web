import { cn } from '../../lib/utils'
import { OptimizedImage } from '../optimized-image'

/* Unified frame for FeatureSection hero screenshots: shared rounding, border, shadow, and hover lift.
   Hover scale is gated to md+ pointers (touch taps leave :hover stuck) and to motion-safe. */
const FeatureScreenshotFrame = ({ src, alt, className, imgClassName, ...imgProps }) => (
  <div
    className={cn(
      'bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] [box-shadow:var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 motion-safe:md:hover:scale-[1.02] hover:[box-shadow:var(--apple-shadow-2xl)] motion-reduce:transition-none',
      className
    )}
  >
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('w-full h-auto object-cover', imgClassName)}
      {...imgProps}
    />
  </div>
)

export { FeatureScreenshotFrame }
