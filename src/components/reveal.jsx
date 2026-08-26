import { clamp, easeOutCubic, useScrubProgress } from '../lib/scrub-progress'

// 由 scrub 进度推导可回退的 reveal 进度（非线性缓动）
export const revealFrom = (progress, span = 0.3, offset = 0.03) =>
  easeOutCubic(clamp((progress - offset) / span, 0, 1))

// 可回退的滚动浮现容器：向下滚动显现，向上滚动按同一曲线隐去
export const Reveal = ({
  motionScale = 1,
  y = 28,
  scale = 0,
  span = 0.3,
  className = '',
  children,
  ...rest
}) => {
  const { ref, progress } = useScrubProgress()
  const animated = motionScale > 0
  const reveal = animated ? revealFrom(progress, span) : 1
  const inv = 1 - reveal

  const style = animated
    ? {
        opacity: reveal,
        transform: `translate3d(0, ${(inv * y * motionScale).toFixed(2)}px, 0)${
          scale ? ` scale(${(1 - inv * scale * motionScale).toFixed(4)})` : ''
        }`,
        willChange: 'transform, opacity',
      }
    : undefined

  return (
    <div ref={ref} className={className} style={style} {...rest}>
      {children}
    </div>
  )
}
