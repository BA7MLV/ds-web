import { useId, useLayoutEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'

import { useMediaQuery } from '../hooks/use-media-query'
import {
  getActiveIndex,
  getScrollProgress,
  getTranslateX,
} from '../lib/horizontal-scroll-progress'
import { FeaturePanel } from './feature-panel'
import { useLocale } from './locale-toggle'

const MOBILE_QUERY = '(max-width: 768px)'
const SPRING_CONFIG = { stiffness: 220, damping: 36, mass: 0.75 }
const MotionTrack = motion.div

const ProgressDots = ({ panels, activeIndex }) => {
  const { t } = useLocale()
  return (
  <div
    className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5"
    role="status"
    aria-label={t('hfs.progress', '当前第 {current} 个功能面板，共 {total} 个', {
      current: activeIndex + 1,
      total: panels.length,
    })}
  >
    {panels.map((panel, index) => {
      const isActive = index === activeIndex
      return (
        <span
          key={panel.id ?? index}
          role="presentation"
          aria-hidden="true"
          className={`block h-1.5 rounded-full transition-[width,background-color] duration-200 ${
            isActive
              ? 'w-4 bg-[color:var(--apple-ink)]'
              : 'w-1.5 bg-[color:var(--apple-ink)]/25'
          }`}
        />
      )
    })}
  </div>
  )
}

const SkipLink = ({ href }) => {
  const { t } = useLocale()
  return (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[color:var(--apple-surface-elevated)] focus:px-3 focus:py-2 focus:text-sm focus:text-[color:var(--apple-ink)] focus:shadow-md"
  >
    {t('hfs.skip', '跳过功能展示')}
  </a>
  )
}

/**
 * Sticky horizontal feature scroller driven by vertical scroll progress.
 * Falls back to a vertical stack on narrow viewports or reduced motion.
 */
export const HorizontalFeatureScroll = ({ panels = [] }) => {
  const { t } = useLocale()
  const panelCount = panels.length
  const reactId = useId()
  const skipTargetId = `hfs-end-${reactId.replace(/:/g, '')}`

  const containerRef = useRef(null)
  const stickyRef = useRef(null)
  const activeIndexRef = useRef(0)

  const prefersReducedMotion = useReducedMotion()
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const shouldStack = Boolean(prefersReducedMotion) || isMobile

  const xTarget = useMotionValue(0)
  // Horizontal path never runs under reduced-motion (that path stacks), so always spring.
  const x = useSpring(xTarget, SPRING_CONFIG)

  const [activeIndex, setActiveIndex] = useState(0)

  useLayoutEffect(() => {
    if (shouldStack || panelCount === 0) return undefined

    const container = containerRef.current
    const sticky = stickyRef.current
    if (!container || !sticky) return undefined

    let rafId = 0

    const measure = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0
      const rect = container.getBoundingClientRect()
      const containerTop = rect.top + scrollY
      const containerHeight = container.offsetHeight
      const viewportHeight = window.innerHeight
      // Same width basis as CSS panels (sticky clientWidth), not 100vw / innerWidth.
      const viewportWidth = sticky.clientWidth || window.innerWidth

      const nextProgress = getScrollProgress({
        scrollY,
        containerTop,
        containerHeight,
        viewportHeight,
      })

      xTarget.set(
        getTranslateX({
          progress: nextProgress,
          panelCount,
          viewportWidth,
        }),
      )

      const nextIndex = getActiveIndex({ progress: nextProgress, panelCount })
      if (nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex
        setActiveIndex(nextIndex)
      }
    }

    const schedule = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        measure()
      })
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [shouldStack, panelCount, xTarget])

  if (panelCount === 0) return null

  if (shouldStack) {
    return (
      <>
        <SkipLink href={`#${skipTargetId}`} />
        <section aria-label={t('hfs.sectionLabel', '功能展示')} className="bg-[color:var(--apple-surface)]">
          {panels.map((panel) => (
            <div
              key={panel.id}
              className="flex min-h-screen w-full items-center justify-center"
            >
              <FeaturePanel
                title={panel.title}
                description={panel.description}
                imageSrc={panel.imageSrc}
                imageAlt={panel.imageAlt}
              />
            </div>
          ))}
        </section>
        <div id={skipTargetId} tabIndex={-1} />
      </>
    )
  }

  // Track is panelCount × sticky width; each panel is 1/panelCount of the track (= sticky width).
  const trackWidthPercent = panelCount * 100
  const panelWidthPercent = 100 / panelCount

  return (
    <>
      <SkipLink href={`#${skipTargetId}`} />
      <section
        ref={containerRef}
        aria-label={t('hfs.sectionLabel', '功能展示')}
        className="relative"
        style={{ height: `${panelCount * 100}vh` }}
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen w-full overflow-hidden bg-[color:var(--apple-surface)]"
        >
          <MotionTrack
            className="flex h-full will-change-transform"
            style={{ x, width: `${trackWidthPercent}%` }}
          >
            {panels.map((panel) => (
              <div
                key={panel.id}
                className="h-full shrink-0"
                style={{ width: `${panelWidthPercent}%` }}
              >
                <FeaturePanel
                  title={panel.title}
                  description={panel.description}
                  imageSrc={panel.imageSrc}
                  imageAlt={panel.imageAlt}
                />
              </div>
            ))}
          </MotionTrack>

          <ProgressDots panels={panels} activeIndex={activeIndex} />
        </div>
      </section>
      <div id={skipTargetId} tabIndex={-1} />
    </>
  )
}
