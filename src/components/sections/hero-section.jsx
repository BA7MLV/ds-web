import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../locale-toggle'
import { OptimizedImage } from '../optimized-image'
import { useScrollY } from '../../hooks/useScroll'

const SUBTEXT_FADE_DURATION_MS = 200

// Same pattern as mobile-nav-menu: lets the hero honor the OS setting even
// when a parent forgets to zero out motionScale.
const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReduced(query.matches)
    handleChange()
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}

const getViewportBucket = () => {
  if (typeof window === 'undefined') return 'unknown'
  const width = window.innerWidth || 0
  if (width >= 1280) return 'xl'
  if (width >= 1024) return 'lg'
  if (width >= 640) return 'sm'
  return 'xs'
}

const trackUiEvent = (name, payload = {}) => {
  if (typeof window === 'undefined') return
  const detail = {
    name,
    ts: Date.now(),
    viewport: getViewportBucket(),
    ...payload,
  }
  window.dispatchEvent(new CustomEvent('ds:analytics', { detail }))
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...detail })
  }
}

export const heroPreviewItems = [
  { id: 'chat', labelKey: 'hero.preview.chat', subtextKey: 'hero.preview.subtext.chat' },
  { id: 'skills', labelKey: 'hero.preview.skills', subtextKey: 'hero.preview.subtext.skills' },
  { id: 'knowledge', labelKey: 'hero.preview.knowledge', subtextKey: 'hero.preview.subtext.knowledge' },
  { id: 'providers', labelKey: 'hero.preview.providers', subtextKey: 'hero.preview.subtext.providers' },
]

export const HeroPreview = ({ style, className = 'max-w-[28rem] sm:max-w-[56rem] lg:max-w-[68rem]' }) => {
  const heroImageSrc = '/img/example/软件主页图.png'

  return (
    <div className={`relative w-full ${className}`} style={style}>
      <div
        className="relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] border border-[color:var(--apple-line)] bg-[color:var(--apple-surface-elevated)] shadow-[var(--apple-shadow-xl)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 via-transparent to-black/[0.02] dark:from-white/[0.04] dark:to-transparent" aria-hidden />
        {/* width/height 取 1600.webp 的真实尺寸（1600×923），仅用于预留宽高比，显示尺寸由 CSS 控制 */}
        <OptimizedImage
          src={heroImageSrc}
          alt="DeepStudent 主页面预览"
          className="block w-full h-auto object-contain"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="(min-width: 1536px) 66vw, (min-width: 1024px) 72vw, 96vw"
          draggable="false"
          width={1600}
          height={923}
        />
      </div>
      <div
        className="absolute -inset-x-[8%] -bottom-[12%] h-[40%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,var(--apple-glow),transparent_70%)] blur-2xl opacity-60 pointer-events-none"
        aria-hidden
      />
    </div>
  )
}

export const HeroSection = ({ onDownload = () => {}, motionScale = 1 }) => {
  const { t, isChinese } = useLocale()
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldAnimate = motionScale > 0 && !prefersReducedMotion
  const [activePreviewId, setActivePreviewId] = useState(heroPreviewItems[0].id)
  const activePreviewItem = heroPreviewItems.find(item => item.id === activePreviewId) || heroPreviewItems[0]
  const [isSubtextVisible, setIsSubtextVisible] = useState(true)
  const [isSubtextAnimating, setIsSubtextAnimating] = useState(false)
  const subtextSwapTimerRef = useRef(null)
  const subtextResetTimerRef = useRef(null)
  const previewDotRefs = useRef([])
  const scrollY = useScrollY()
  const showScrollHint = scrollY < 100

  useEffect(() => {
    return () => {
      if (subtextSwapTimerRef.current) window.clearTimeout(subtextSwapTimerRef.current)
      if (subtextResetTimerRef.current) window.clearTimeout(subtextResetTimerRef.current)
    }
  }, [])

  const handleExplore = () => {
    if (typeof document === 'undefined') return
    const target = document.getElementById('features')
    if (!target) return
    target.scrollIntoView({ behavior: shouldAnimate ? 'smooth' : 'auto', block: 'start' })
  }

  const handleDownloadClick = () => {
    trackUiEvent('hero_cta_primary_click', { location: 'hero' })
    onDownload()
  }

  const handleExploreClick = () => {
    trackUiEvent('hero_cta_secondary_click', { location: 'hero' })
    handleExplore()
  }

  const handleSubtextClick = () => {
    if (isSubtextAnimating) return

    const currentIndex = heroPreviewItems.findIndex(item => item.id === activePreviewId)
    const nextIndex = (currentIndex + 1) % heroPreviewItems.length
    const nextId = heroPreviewItems[nextIndex].id

    if (!shouldAnimate) {
      setActivePreviewId(nextId)
      return
    }

    if (subtextSwapTimerRef.current) window.clearTimeout(subtextSwapTimerRef.current)
    if (subtextResetTimerRef.current) window.clearTimeout(subtextResetTimerRef.current)

    setIsSubtextAnimating(true)
    setIsSubtextVisible(false)

    subtextSwapTimerRef.current = window.setTimeout(() => {
      setActivePreviewId(nextId)
      setIsSubtextVisible(true)
      subtextSwapTimerRef.current = null
    }, SUBTEXT_FADE_DURATION_MS)

    subtextResetTimerRef.current = window.setTimeout(() => {
      setIsSubtextAnimating(false)
      subtextResetTimerRef.current = null
    }, SUBTEXT_FADE_DURATION_MS * 2)
  }

  // Guarded to avoid racing the subtext swap timers mid-fade.
  const selectPreview = (id) => {
    if (id === activePreviewId || isSubtextAnimating) return
    setActivePreviewId(id)
  }

  const handlePreviewKeyDown = (event) => {
    const count = heroPreviewItems.length
    const currentIndex = heroPreviewItems.findIndex(item => item.id === activePreviewId)
    let nextIndex = null

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % count
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + count) % count
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = count - 1
        break
      default:
        return
    }

    event.preventDefault()
    selectPreview(heroPreviewItems[nextIndex].id)
    previewDotRefs.current[nextIndex]?.focus()
  }

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen pt-20 pb-16 flex items-center overflow-hidden lg:overflow-visible"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[980px] h-[760px] bg-[radial-gradient(ellipse_at_center,var(--apple-glow),transparent_82%)] blur-[150px] opacity-55" />
      </div>

      <div
        className={`relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${
          shouldAnimate ? 'animate-fade-in' : ''
        }`}
        style={shouldAnimate ? { animationDelay: '0.08s' } : undefined}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.9fr)] gap-8 sm:gap-10 lg:gap-8 xl:gap-12 items-center">
          <div className="flex flex-col items-start text-left order-2 lg:order-1">
            <p className="mb-3 text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase text-[color:var(--apple-muted)]">
              DeepStudent
            </p>
            {/* Apple headline tokens: ~40px uses 1.1/0em, ~56px uses 1.07/-0.007em */}
            <h1
              id="hero-heading"
              className="text-[clamp(2.25rem,5vw,3.5rem)] font-semibold mb-4 leading-[1.1] tracking-[-0.002em] sm:leading-[1.07] sm:tracking-[-0.007em] text-[color:var(--apple-ink)] text-balance"
            >
              {t('hero.headline.top')}
              <br />
              <span className={isChinese ? 'inline-block whitespace-nowrap' : 'whitespace-normal break-words'}>
                {t('hero.headline.bottom')}
              </span>
            </h1>

            {/* aria-disabled (not disabled) keeps keyboard focus while the fade runs;
                handleSubtextClick already ignores re-entry. */}
            <button
              type="button"
              onClick={handleSubtextClick}
              aria-disabled={isSubtextAnimating}
              aria-describedby="hero-preview-subtext-hint"
              className="focus-ring rounded-lg text-left mb-8 cursor-pointer transition-opacity duration-150 ease-out motion-reduce:transition-none hover:opacity-85"
            >
              <span id="hero-preview-subtext-hint" className="sr-only">
                {t('hero.preview.hint', isChinese ? '轻点切换下一条功能简介' : 'Show the next feature highlight')}
              </span>
              <span className="relative inline-flex min-h-[3.2em] sm:min-h-[2.4em] items-start overflow-visible align-top">
                <span
                  aria-live="polite"
                  className={`text-base sm:text-lg leading-relaxed text-[color:var(--apple-muted)] whitespace-normal break-words text-pretty transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                    isSubtextVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {t(activePreviewItem.subtextKey)}
                </span>
              </span>
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadClick}
                className="btn-apple-primary group w-full sm:w-auto"
              >
                <span className="whitespace-nowrap">{t('hero.cta.download')}</span>
                <svg
                  className="w-4 h-4 shrink-0 opacity-90 transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none group-hover:translate-x-0.5 group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleExploreClick}
                className="btn-apple-secondary w-full sm:w-auto"
              >
                {t('hero.cta.explore')}
              </button>
            </div>
            <a
              href="https://github.com/helixnow/deep-student"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2 text-[13px] font-medium text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] transition-colors mb-8"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-80" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>在 GitHub 上查看源码</span>
            </a>
            {/* gap-3 leaves 6px per side for the invisible before: hit area (~38px tall)
                without adjacent targets overlapping. */}
            <div
              className="flex items-center gap-3 mb-2"
              role="tablist"
              aria-label={t('hero.preview.label', isChinese ? '功能预览' : 'Feature preview')}
            >
              {heroPreviewItems.map((item, index) => {
                const isActive = item.id === activePreviewId
                return (
                  <button
                    key={item.id}
                    ref={(node) => { previewDotRefs.current[index] = node }}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectPreview(item.id)}
                    onKeyDown={handlePreviewKeyDown}
                    className={`focus-ring relative h-1.5 rounded-full touch-manipulation transition-all duration-300 ease-apple motion-reduce:transition-none before:absolute before:-inset-x-1.5 before:-inset-y-4 before:content-[''] ${
                      isActive ? 'w-6 bg-[color:var(--apple-ink)]' : 'w-1.5 bg-[color:var(--apple-line-strong)] hover:bg-[color:var(--apple-muted)]'
                    }`}
                    aria-label={t(item.labelKey)}
                  />
                )
              })}
            </div>

            {showScrollHint && (
              <div
                className="focus-ring rounded-md hidden lg:flex flex-col items-start gap-1.5 cursor-pointer hover:opacity-80 transition-all duration-500 motion-reduce:transition-none mt-8"
                onClick={handleExploreClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  handleExploreClick()
                }}
                aria-label={t('hero.scrollDown', '向下滚动')}
              >
                <span className="text-[10px] text-[color:var(--apple-muted)] tracking-wider uppercase">{t('hero.scrollDown', '向下滚动')}</span>
                <svg
                  className="w-5 h-5 text-[color:var(--apple-muted)] animate-bounce-down"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            )}

          </div>
          
          <div className="flex justify-center lg:justify-end order-1 lg:order-2 lg:translate-x-[6vw] xl:translate-x-[11vw]">
            <HeroPreview
              className="max-w-[58rem] sm:max-w-[104rem] lg:w-[185%] xl:w-[205%] 2xl:w-[220%] lg:max-w-none"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
