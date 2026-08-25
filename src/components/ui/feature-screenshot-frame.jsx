import { cn } from '../../lib/utils'
import { OptimizedImage } from '../optimized-image'
import { getScreenshotDimensions } from '../../data/screenshot-dimensions'

/* Unified frame for FeatureSection hero screenshots: shared rounding, border, shadow, and hover lift.
   Hover scale is gated to md+ pointers (touch taps leave :hover stuck) and to motion-safe.
   Dark-mode shadows are pure black on a black page, so the border steps up to
   --apple-line-strong there to keep the frame edge legible. */
const FeatureScreenshotFrame = ({ src, alt, className, imgClassName, width, height, ...imgProps }) => {
  // 懒加载图未声明固有尺寸时，加载完成会把下方内容顶开（CLS）；
  // 默认按真实切片尺寸预留宽高比，调用方仍可显式覆盖
  const intrinsic = getScreenshotDimensions(src)

  return (
    <div
      className={cn(
        'bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] dark:border-[color:var(--apple-line-strong)] [box-shadow:var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 motion-safe:md:hover:scale-[1.02] hover:[box-shadow:var(--apple-shadow-2xl)] motion-reduce:transition-none',
        className
      )}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        className={cn('w-full h-auto object-cover', imgClassName)}
        width={width ?? intrinsic.width}
        height={height ?? intrinsic.height}
        {...imgProps}
      />
    </div>
  )
}

export { FeatureScreenshotFrame }
