import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from '../locale-toggle'
import { OptimizedImage } from '../optimized-image'
import { FeatureScreenshotFrame } from '../ui/feature-screenshot-frame'
import { getScreenshotDimensions } from '../../data/screenshot-dimensions'
import { useScrollY, useViewportHeight } from '../../hooks/useScroll'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const stretchProgress = (value, stretch = 1.3) => clamp((value - 0.5) / stretch + 0.5, 0, 1)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const useParallaxProgress = ({
  rootMargin = '200px 0px',
  freezeWhenInactive = true,
} = {}) => {
  const ref = useRef(null)
  const [metrics, setMetrics] = useState({ top: 0, height: 0 })
  const [isActive, setIsActive] = useState(false)
  const lastProgress = useRef(0.5)
  const scrollY = useScrollY(isActive)
  const viewportHeight = useViewportHeight(isActive)

  const updateMetrics = useCallback(() => {
    if (!ref.current || typeof window === 'undefined') return
    const rect = ref.current.getBoundingClientRect()
    const scrollTop = window.scrollY || window.pageYOffset || 0
    setMetrics({ top: rect.top + scrollTop, height: rect.height })
  }, [])

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return undefined
    const element = ref.current
    updateMetrics()

    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateMetrics())
      resizeObserver.observe(element)
    } else {
      window.addEventListener('resize', updateMetrics)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', updateMetrics)
      }
    }
  }, [updateMetrics])

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setIsActive(true)
      return undefined
    }

    const element = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        const nextActive = entry.isIntersecting || entry.intersectionRatio > 0
        setIsActive(nextActive)
        if (nextActive) updateMetrics()
      },
      { rootMargin, threshold: 0.01 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [rootMargin, updateMetrics])

  const progress = metrics.height
    ? (scrollY + viewportHeight - metrics.top) / (metrics.height + viewportHeight)
    : 0.5
  const clamped = clamp(progress, 0, 1)

  if (!freezeWhenInactive || isActive) {
    lastProgress.current = clamped
  }

  return { ref, progress: freezeWhenInactive ? lastProgress.current : clamped, isActive }
}

// 占位图组件 - 精致 shimmer，后续替换为真实截图
export const ImagePlaceholder = ({ label }) => {
  const { t } = useLocale()

  return (
    <div
      className="w-full aspect-[16/10] rounded-[6px] border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] flex items-center justify-center relative overflow-hidden [box-shadow:var(--apple-shadow-md)]"
      role="img"
      aria-label={label}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 30% 20%, var(--apple-blue-soft), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(191, 90, 242, 0.08), transparent 50%)',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 skeleton opacity-30" aria-hidden />
      <div className="z-10 flex flex-col items-center gap-3 px-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--apple-surface-elevated)] border border-[color:var(--apple-line)] [box-shadow:var(--apple-shadow-sm)]">
          <svg className="w-5 h-5 text-[color:var(--apple-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <span className="text-[12px] sm:text-[13px] text-[color:var(--apple-muted)] font-medium leading-snug max-w-[16rem]">
          {label}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[color:var(--apple-muted)] opacity-50">
          {t('placeholder.status.preview')}
        </span>
      </div>
    </div>
  )
}

// 动画变体定义
// 移动端（< md）统一收敛为轻量上浮淡入：横向位移在触控滚动时会造成
// 页面横向溢出/晃动，blur 滤镜在移动端 GPU 上开销偏高；
// md 及以上保留各变体的方向差异，维持桌面端视觉节奏
export const revealAnimations = {
  'fade-up':    { hidden: 'opacity-0 translate-y-6 md:translate-y-10',  visible: 'opacity-100 translate-y-0' },
  'fade-down':  { hidden: 'opacity-0 translate-y-6 md:-translate-y-10', visible: 'opacity-100 translate-y-0' },
  'fade-left':  { hidden: 'opacity-0 translate-y-6 md:translate-y-0 md:translate-x-12',  visible: 'opacity-100 translate-y-0 translate-x-0' },
  'fade-right': { hidden: 'opacity-0 translate-y-6 md:translate-y-0 md:-translate-x-12', visible: 'opacity-100 translate-y-0 translate-x-0' },
  'scale-up':   { hidden: 'opacity-0 translate-y-6 md:translate-y-0 md:scale-90',        visible: 'opacity-100 translate-y-0 scale-100' },
  'blur-in':    { hidden: 'opacity-0 translate-y-6 md:translate-y-0 md:blur-[6px] md:scale-[0.97]', visible: 'opacity-100 translate-y-0 blur-0 scale-100' },
}

// 根据 index 自动选择动画变体，形成视觉节奏
const getAnimationVariant = (index) => {
  const variants = ['fade-up', 'fade-left', 'fade-right', 'scale-up', 'blur-in', 'fade-down']
  return variants[index % variants.length]
}

// 滚动浮现的独立图文项（用于移动端回退）
export const ScrollRevealItem = ({ imgSrc, title, desc, align = 'left', index, animation }) => {
  const itemRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = itemRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      // 阈值略低、下边距略收，触控快速滑动时浮现不迟到
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const variant = animation || getAnimationVariant(index)
  const anim = revealAnimations[variant] || revealAnimations['fade-up']
  const isLeft = align === 'left'

  // 交错延迟仅在 md 及以上生效：移动端条目独占视口宽度、逐个进入，
  // 叠加索引延迟只会让触控滚动时的浮现显得迟钝
  return (
    <div
      ref={itemRef}
      className={`scroll-reveal-item flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-4 sm:gap-6 md:gap-12 transition-[opacity,transform,filter] duration-500 md:duration-700 ease-apple motion-reduce:transition-none md:delay-[var(--reveal-delay,0ms)] ${isVisible ? anim.visible : anim.hidden}`}
      style={{ '--reveal-delay': `${Math.min(index * 100, 400)}ms` }}
    >
      <div className="w-full md:w-[66%] md:flex-shrink-0">
        {imgSrc ? (
          <FeatureScreenshotFrame
            src={imgSrc}
            alt={title}
            loading="lazy"
            // 触控设备上 tap 会残留 :hover 态：md 以下取消悬停放大与阴影加深，避免“粘住”的缩放
            // --apple-shadow-2xl 尚未定义，回退到 xl 以免悬停时阴影解析为 none 而消失
            className="hover:scale-100 motion-safe:hover:scale-100 hover:[box-shadow:var(--apple-shadow-xl)] md:motion-safe:hover:scale-[1.02] md:hover:[box-shadow:var(--apple-shadow-2xl,var(--apple-shadow-xl))]"
          />
        ) : (
          <ImagePlaceholder label={title} />
        )}
      </div>
      <div className="flex-1 min-w-0 text-center md:text-left">
        <h3 className="text-[clamp(1.125rem,1.8vw,1.25rem)] font-semibold text-[color:var(--apple-ink)] mb-2 tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-body-large text-[color:var(--apple-muted)] max-w-md mx-auto md:mx-0">
          {desc}
        </p>
      </div>
    </div>
  )
}

// ===== 交错图文展示组件 =====
export const AlternatingFeatureGroup = ({ items, t }) => {
  return (
    <div className="space-y-[3.5rem] sm:space-y-[4.5rem] md:space-y-[6rem]">
      {items.map((sf, index) => (
        <ScrollRevealItem
          key={sf.labelKey}
          imgSrc={sf.imgSrc}
          title={t(sf.labelKey)}
          desc={t(sf.descKey)}
          align={index % 2 === 0 ? 'left' : 'right'}
          index={index}
          animation={getAnimationVariant(index)}
        />
      ))}
    </div>
  )
}

// ===== Sticky 图片切换组件 =====
// 左侧使用原生 CSS sticky，右侧文字滚动触发图片 crossfade 切换
export const StickyImageFeatureGroup = ({ items, t }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef(null)
  const leadingMarkerRef = useRef(null)
  const markerRefs = useRef([])
  const mediaFrameRef = useRef(null)

  // 仅在组件接近/处于视口时才做滚动计算与合成层提示，
  // 离开视口后移除 scroll 监听并把 will-change 归还为 auto
  useEffect(() => {
    const element = containerRef.current
    if (!element || typeof window === 'undefined') return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setIsInView(entry.isIntersecting)
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // 使用统一滚动边界判定激活项：
  // 当「图片中心」对齐到「span 标记上方 1/4 图片高度」时触发切换
  // => spanTop <= imageTop + imageHeight * 3/4
  useEffect(() => {
    if (typeof window === 'undefined' || !isInView) return undefined

    let rafId = null

    const getTriggerBoundaryY = () => {
      const mediaNode = mediaFrameRef.current
      if (!mediaNode) return 0
      const { top, height } = mediaNode.getBoundingClientRect()
      return top + height * (3 / 4)
    }

    const updateActiveByAnchor = () => {
      const boundaryY = getTriggerBoundaryY()
      let nextIndex = 0
      const triggerNodes = [leadingMarkerRef.current, ...markerRefs.current]

      for (let i = 0; i < triggerNodes.length; i += 1) {
        const node = triggerNodes[i]
        if (!node) continue
        const { top } = node.getBoundingClientRect()
        if (top <= boundaryY) {
          nextIndex = Math.min(Math.max(i - 1, 0), items.length - 1)
        } else {
          break
        }
      }

      setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex))
    }

    const onScrollOrResize = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        updateActiveByAnchor()
      })
    }

    updateActiveByAnchor()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [items.length, isInView])

  return (
    <div ref={containerRef} className="relative">
      {/* 移动端：普通流式布局，带多样化进入动画；组间距与 AlternatingFeatureGroup 移动端节奏对齐 */}
      <div className="md:hidden space-y-[3.5rem] sm:space-y-[4.5rem]">
        {items.map((sf, index) => (
          <ScrollRevealItem
            key={sf.labelKey}
            imgSrc={sf.imgSrc}
            title={t(sf.labelKey)}
            desc={t(sf.descKey)}
            align={index % 2 === 0 ? 'left' : 'right'}
            index={index}
            animation={getAnimationVariant(index)}
          />
        ))}
      </div>

      {/* 桌面端：左侧 CSS sticky 图片 + 右侧滚动文字 */}
      <div className="hidden md:grid md:grid-cols-[2fr_1fr] gap-12 lg:gap-16">
        {/* 左侧图片列：由原生 sticky 固定在视口顶部偏移处 */}
        <div className="min-w-0">
          <div className="sticky top-32 z-10 w-full">
            <div ref={mediaFrameRef} className="relative aspect-video rounded-[6px] flex items-center justify-center">
              {items.map((sf, i) => {
                const isActive = i === activeIndex
                // 仅给参与当前 crossfade 的相邻层保留合成层提示：
                // 全量 will-change 会让每张截图长期各占一份 GPU 纹理，长页滚动时内存压力大
                const isNearActive = Math.abs(i - activeIndex) <= 1
                return (
                  <div
                    key={sf.labelKey}
                    className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-700 ease-apple ${
                      isActive
                        ? 'opacity-100 motion-safe:scale-100'
                        : 'opacity-0 pointer-events-none motion-safe:scale-[1.015]'
                    }`}
                    style={{ willChange: isInView && isNearActive ? 'transform, opacity' : 'auto' }}
                    aria-hidden={!isActive}
                  >
                    {sf.imgSrc ? (
                      <OptimizedImage
                        src={sf.imgSrc}
                        alt={t(sf.labelKey)}
                        className="w-auto h-auto max-w-full max-h-full rounded-[6px] [box-shadow:var(--apple-shadow-xl)]"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        fetchPriority={i === 0 ? 'high' : 'auto'}
                        // aspect-video 容器已挡住页面级 CLS；声明固有尺寸让图片在解码前
                        // 就能按真实宽高比参与 max-w/max-h 约束，crossfade 层间不再跳动
                        {...getScreenshotDimensions(sf.imgSrc)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent motion-safe:animate-shimmer" />
                        <div className="z-10 flex flex-col items-center gap-3">
                          <svg className="w-10 h-10 text-[color:var(--apple-muted)] opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                          <span className="text-sm text-[color:var(--apple-muted)] opacity-50 font-medium">
                            {t(sf.labelKey)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {/* 图片下方的指示器 */}
            <div className="flex justify-center gap-2 mt-5" aria-hidden="true">
              {items.map((sf, i) => (
                <div
                  key={sf.labelKey}
                  className={`h-1.5 rounded-full transition-[width,background-color,box-shadow] duration-300 ease-apple ${
                    i === activeIndex
                      ? 'w-6 bg-[color:var(--apple-ink)] [box-shadow:var(--apple-shadow-sm)]'
                      : 'w-1.5 bg-[color:var(--apple-line-strong)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 右侧滚动文字区 */}
        <div className="min-w-0">
          <div className="space-y-0">
            <div ref={leadingMarkerRef} className="h-0 opacity-0 pointer-events-none" aria-hidden="true" />
            {items.map((sf, index) => {
              const isActive = index === activeIndex
              return (
                <div
                  key={sf.labelKey}
                  className="min-h-[50vh] flex items-center"
                >
                  <div
                    className={`py-6 transition-[opacity,transform] duration-500 ease-apple ${
                      isActive
                        ? 'opacity-100 motion-safe:translate-x-0'
                        : 'opacity-30 motion-safe:translate-x-2'
                    }`}
                    // 与左侧图层同策略：只提升 active±1 的文字块，其余归还 auto
                    style={{ willChange: isInView && Math.abs(index - activeIndex) <= 1 ? 'transform, opacity' : 'auto' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        ref={(el) => { markerRefs.current[index] = el }}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-[11px] font-semibold tabular-nums transition-[background-color,border-color,color,box-shadow,transform] duration-500 ease-apple ${
                        isActive
                          ? 'border-transparent bg-[color:var(--apple-ink)] text-[color:var(--apple-surface)] [box-shadow:var(--apple-shadow-sm)] motion-safe:scale-105'
                          : 'border-[color:var(--apple-line-strong)] bg-transparent text-[color:var(--apple-muted)] motion-safe:scale-100'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className={`h-px flex-1 origin-left bg-[color:var(--apple-line-strong)] transition-[opacity,transform] duration-500 ease-apple ${
                        isActive ? 'opacity-100 motion-safe:scale-x-100' : 'opacity-0 motion-safe:scale-x-0'
                      }`} />
                    </div>
                    <h3 className="text-[clamp(1.25rem,1.6vw,1.375rem)] font-semibold text-[color:var(--apple-ink)] mb-2.5 tracking-tight leading-tight">
                      {t(sf.labelKey)}
                    </h3>
                    <p className="text-body-large text-[color:var(--apple-muted)]">
                      {t(sf.descKey)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export const FeatureSection = ({ id, title, desc, align, children, motionScale = 1, subFeatures = [], layout = 'alternating' }) => {
  const { ref, progress, isActive } = useParallaxProgress()
  const { t } = useLocale()
  const contentDirection = align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
  const motionAmount = Math.max(0, motionScale)
  const isStatic = motionAmount === 0
  const shouldAnimate = !isStatic && isActive
  const timelineProgress = stretchProgress(progress, 1.35)
  const easedProgress = easeInOutCubic(timelineProgress)
  const focus = Math.sin(easedProgress * Math.PI)
  const juice = Math.pow(focus, 0.78)
  const reveal = isStatic ? 1 : easeOutCubic(clamp((progress - 0.04) / 0.36, 0, 1))
  const offset = (easedProgress - 0.5) * motionAmount
  const textShift = offset * (190 + 16 * juice)
  const mediaShift = offset * (260 + 45 * juice)
  const opacity = isStatic ? 1 : 0.14 + reveal * 0.86

  return (
    <section ref={ref} id={id} className="px-4 sm:px-6 max-w-[90rem] mx-auto py-[3rem] sm:py-[5rem] md:py-[8rem] scroll-mt-28">
      <div className={`flex flex-col ${contentDirection} items-center gap-[3rem] sm:gap-[5rem] md:gap-[4rem]`}>
        <div
          className="flex-1 md:max-w-[33%] text-center md:text-left"
          style={{
            transform: isStatic ? 'none' : `translateY(${Math.round(textShift)}px)`,
            opacity,
            willChange: shouldAnimate ? 'transform, opacity' : 'auto',
          }}
        >
          <h2 className="text-section-title font-display text-[color:var(--apple-ink)] mb-[1.5rem]">
            {title}
          </h2>
          <p className="text-body-large font-medium text-[color:var(--apple-muted)] mx-auto md:mx-0">{desc}</p>
        </div>

        <div
          className="flex-[2] w-full md:max-w-[66%]"
          style={{
            transform: isStatic ? 'none' : `translateY(${Math.round(mediaShift)}px)`,
            opacity,
            willChange: shouldAnimate ? 'transform, opacity' : 'auto',
          }}
        >
          {children}
        </div>
      </div>

      {/* 子功能图文展示区 - 支持 Sticky 或交错布局 */}
      {subFeatures.length > 0 && (
        <div className="mt-[3rem] sm:mt-[4rem] md:mt-[5rem]">
          {layout === 'sticky' ? (
            <StickyImageFeatureGroup items={subFeatures} t={t} />
          ) : (
            <AlternatingFeatureGroup items={subFeatures} t={t} />
          )}
        </div>
      )}
    </section>
  )
}
