import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ThemeToggle, useTheme } from './components/theme-toggle'
import { LocaleToggle, useLocale } from './components/locale-toggle'

const logo = '/logo-r.svg'
const logoDark = '/logo-r-dark.svg'

const cardHeaderClass = 'flex items-center gap-3 mb-[1.618rem]'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const stretchProgress = (value, stretch = 1.3) => clamp((value - 0.5) / stretch + 0.5, 0, 1)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const buildHash = import.meta.env.VITE_BUILD_HASH || 'dev'

const getIsDownloadFromLocation = () => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('view') === 'download'
}

const scrollStore = (() => {
  let value = 0
  let rafId = null
  const listeners = new Set()

  const notify = () => {
    listeners.forEach((listener) => listener())
  }

  const update = () => {
    value = window.scrollY || window.pageYOffset || 0
    notify()
  }

  const onScroll = () => {
    if (rafId) return
    rafId = window.requestAnimationFrame(() => {
      rafId = null
      update()
    })
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    if (listeners.size === 1 && typeof window !== 'undefined') {
      update()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
    }

    return () => {
      listeners.delete(listener)
      if (listeners.size === 0 && typeof window !== 'undefined') {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        if (rafId) {
          window.cancelAnimationFrame(rafId)
          rafId = null
        }
      }
    }
  }

  return { getSnapshot: () => value, subscribe }
})()

const viewportStore = (() => {
  let height = 0
  const listeners = new Set()

  const update = () => {
    height = window.innerHeight || 0
    listeners.forEach((listener) => listener())
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    if (listeners.size === 1 && typeof window !== 'undefined') {
      update()
      window.addEventListener('resize', update)
      window.addEventListener('orientationchange', update)
    }
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0 && typeof window !== 'undefined') {
        window.removeEventListener('resize', update)
        window.removeEventListener('orientationchange', update)
      }
    }
  }

  return { getSnapshot: () => height, subscribe }
})()

const useScrollY = (enabled = true) => {
  const subscribe = useCallback(
    (listener) => (enabled ? scrollStore.subscribe(listener) : () => {}),
    [enabled]
  )
  return useSyncExternalStore(subscribe, scrollStore.getSnapshot, () => 0)
}

const useViewportHeight = (enabled = true) => {
  const subscribe = useCallback(
    (listener) => (enabled ? viewportStore.subscribe(listener) : () => {}),
    [enabled]
  )
  return useSyncExternalStore(subscribe, viewportStore.getSnapshot, () => 0)
}

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

const useResponsiveMotion = () => {
  const [settings, setSettings] = useState({ motionScale: 1, isCompact: false })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compactQuery = window.matchMedia('(max-width: 768px)')

    const update = () => {
      const isCompact = compactQuery.matches
      const reduceMotion = motionQuery.matches
      const motionScale = reduceMotion ? 0 : isCompact ? 0.45 : 1
      setSettings({ motionScale, isCompact })
    }

    update()

    const attach = (query) => {
      if (query.addEventListener) {
        query.addEventListener('change', update)
        return () => query.removeEventListener('change', update)
      }
      query.addListener(update)
      return () => query.removeListener(update)
    }

    const detachMotion = attach(motionQuery)
    const detachCompact = attach(compactQuery)
    return () => {
      detachMotion()
      detachCompact()
    }
  }, [])

  return settings
}

const getPolicyContent = (t) => ({
  about: {
    title: t('policy.about.title', 'About DeepStudent'),
    description: t('policy.about.description', ''),
    sections: [
      {
        title: t('policy.about.section1.title', ''),
        body: t('policy.about.section1.body', ''),
        points: [
          t('policy.about.section1.point1', ''),
          t('policy.about.section1.point2', ''),
        ],
      },
      {
        title: t('policy.about.section2.title', ''),
        body: t('policy.about.section2.body', ''),
        points: [
          t('policy.about.section2.point1', ''),
          t('policy.about.section2.point2', ''),
        ],
      },
      {
        title: t('policy.about.section3.title', ''),
        body: t('policy.about.section3.body', ''),
      },
    ],
    footer: t('policy.about.footer', ''),
  },
  privacy: {
    title: t('policy.privacy.title', 'Privacy Policy'),
    description: t('policy.privacy.description', ''),
    sections: [
      {
        title: t('policy.privacy.section1.title', ''),
        body: t('policy.privacy.section1.body', ''),
        points: [
          t('policy.privacy.section1.point1', ''),
          t('policy.privacy.section1.point2', ''),
        ],
      },
      {
        title: t('policy.privacy.section2.title', ''),
        body: t('policy.privacy.section2.body', ''),
        points: [
          t('policy.privacy.section2.point1', ''),
          t('policy.privacy.section2.point2', ''),
        ],
      },
      {
        title: t('policy.privacy.section3.title', ''),
        body: t('policy.privacy.section3.body', ''),
        points: [
          t('policy.privacy.section3.point1', ''),
          t('policy.privacy.section3.point2', ''),
        ],
      },
    ],
    footer: t('policy.privacy.footer', ''),
  },
  terms: {
    title: t('policy.terms.title', 'Terms of Use'),
    description: t('policy.terms.description', ''),
    sections: [
      {
        title: t('policy.terms.section1.title', ''),
        body: t('policy.terms.section1.body', ''),
        points: [
          t('policy.terms.section1.point1', ''),
          t('policy.terms.section1.point2', ''),
        ],
      },
      {
        title: t('policy.terms.section2.title', ''),
        body: t('policy.terms.section2.body', ''),
        points: [
          t('policy.terms.section2.point1', ''),
          t('policy.terms.section2.point2', ''),
        ],
      },
      {
        title: t('policy.terms.section3.title', ''),
        body: t('policy.terms.section3.body', ''),
        points: [
          t('policy.terms.section3.point1', ''),
          t('policy.terms.section3.point2', ''),
        ],
      },
    ],
    footer: t('policy.terms.footer', ''),
  },
})

// 功能标签导航组件
const FeatureTabNav = () => {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState('chat')
  const scrollY = useScrollY()
  const isSticky = scrollY > 600

  const tabs = [
    { id: 'chat', labelKey: 'featureTab.chat', targetId: 'feature-chat' },
    { id: 'notes', labelKey: 'featureTab.notes', targetId: 'feature-notes' },
    { id: 'textbook', labelKey: 'featureTab.textbook', targetId: 'feature-textbook' },
    { id: 'qbank', labelKey: 'featureTab.qbank', targetId: 'feature-qbank' },
    { id: 'essay', labelKey: 'featureTab.essay', targetId: 'feature-essay' },
    { id: 'translate', labelKey: 'featureTab.translate', targetId: 'feature-translate' },
    { id: 'mindmap', labelKey: 'featureTab.mindmap', targetId: 'feature-mindmap' },
    { id: 'skills', labelKey: 'featureTab.skills', targetId: 'feature-skills' },
    { id: 'anki', labelKey: 'featureTab.anki', targetId: 'feature-anki' },
    { id: 'privacy', labelKey: 'featureTab.privacy', targetId: 'feature-privacy' },
  ]

  const handleTabClick = (tab) => {
    setActiveTab(tab.id)
    const target = document.getElementById(tab.targetId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      className={`sticky top-12 z-30 transition-all duration-300 ${
        isSticky
          ? 'bg-[color:var(--apple-nav-bg)] backdrop-blur-xl border-b border-[color:var(--apple-line)] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`focus-ring whitespace-nowrap px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[color:var(--apple-ink)] text-[color:var(--apple-surface)] shadow-md'
                  : 'text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-card)]'
              }`}
            >
              {t(tab.labelKey, tab.id)}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

// 数据亮点区块组件
const StatsHighlight = ({ motionScale = 1 }) => {
  const { t } = useLocale()
  const shouldAnimate = motionScale > 0

  const stats = [
    { value: '59', labelKey: 'stats.tools', descKey: 'stats.toolsDesc' },
    { value: '17', labelKey: 'stats.providers', descKey: 'stats.providersDesc' },
    { value: '8', labelKey: 'stats.modes', descKey: 'stats.modesDesc' },
    { value: '16+', labelKey: 'stats.formats', descKey: 'stats.formatsDesc' },
  ]

  return (
    <section
      className={`py-[4rem] sm:py-[6rem] px-4 sm:px-6 ${shouldAnimate ? 'animate-fade-in' : ''}`}
      style={shouldAnimate ? { animationDelay: '0.24s' } : undefined}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-[3rem] sm:mb-[4rem]">
          <h2 className="text-[1.5rem] sm:text-[2rem] font-semibold text-[color:var(--apple-ink)] tracking-tight font-display mb-3">
            {t('stats.title', '为深度学习而生')}
          </h2>
          <p className="text-[color:var(--apple-muted)] text-[15px] sm:text-[17px] max-w-2xl mx-auto">
            {t('stats.subtitle', '渐进披露架构，工具按需加载，覆盖学习全场景')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.labelKey}
              className="bg-[color:var(--apple-card)] backdrop-blur-xl border border-[color:var(--apple-line)] rounded-[1.5rem] p-[1.25rem] sm:p-[1.75rem] text-center hover:shadow-[var(--apple-shadow-lg)] hover:-translate-y-1 transition-all duration-500 group"
              style={shouldAnimate ? { animationDelay: `${0.3 + index * 0.08}s` } : undefined}
            >
              <div className="text-[2.5rem] sm:text-[3.5rem] font-bold text-[color:var(--apple-ink)] tracking-tight leading-none mb-2 group-hover:text-[color:var(--apple-blue)] transition-colors">
                {stat.value}
              </div>
              <div className="text-[14px] sm:text-[15px] font-semibold text-[color:var(--apple-ink)] mb-1">
                {t(stat.labelKey)}
              </div>
              <div className="text-[11px] sm:text-[12px] text-[color:var(--apple-muted)] leading-relaxed">
                {t(stat.descKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const App = () => {
  const [activePolicy, setActivePolicy] = useState(null)
  const [isDownloadPage, setIsDownloadPage] = useState(() => getIsDownloadFromLocation())
  const { t } = useLocale()
  const { motionScale } = useResponsiveMotion()
  const homeScrollRef = useRef(0)
  const downloadScrollRef = useRef(0)
  const syncHistoryWithView = useCallback(
    (nextIsDownload, { replace = false } = {}) => {
      if (typeof window === 'undefined') return
      const url = new URL(window.location.href)
      const current = url.searchParams.get('view') === 'download'
      if (nextIsDownload) {
        url.searchParams.set('view', 'download')
      } else {
        url.searchParams.delete('view')
      }
      const method = replace || current === nextIsDownload ? 'replaceState' : 'pushState'
      window.history[method]({}, '', url)
    },
    []
  )

  const handlePolicyOpen = (type) => setActivePolicy(type)
  const handlePolicyClose = () => setActivePolicy(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handlePopState = () => {
      setIsDownloadPage(getIsDownloadFromLocation())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    syncHistoryWithView(isDownloadPage, { replace: true })
  }, [isDownloadPage, syncHistoryWithView])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const targetScroll = isDownloadPage ? downloadScrollRef.current : homeScrollRef.current
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: targetScroll, left: 0, behavior: 'auto' })
    })
  }, [isDownloadPage])

  const handleDownloadOpen = () => {
    homeScrollRef.current = window.scrollY || 0
    setIsDownloadPage(true)
    syncHistoryWithView(true)
  }
  const handleDownloadClose = () => {
    downloadScrollRef.current = window.scrollY || 0
    setIsDownloadPage(false)
    syncHistoryWithView(false)
  }

  return (
    <div className="min-h-screen min-h-[100svh] bg-transparent text-[color:var(--apple-ink)] font-sans overflow-x-hidden selection:bg-black selection:text-white">
      {isDownloadPage ? (
        <DownloadPage onBack={handleDownloadClose} />
      ) : (
        <>
          <TopNav onDownload={handleDownloadOpen} />
          <HeroSection onDownload={handleDownloadOpen} motionScale={motionScale} />

          {/* 功能标签导航 */}
          <FeatureTabNav />

          {/* 数据亮点区块 */}
          <StatsHighlight motionScale={motionScale} />

          <main
            id="features"
            className={`relative z-10 scroll-mt-24 pb-[6.854rem] sm:pb-[11.09rem] ${
              motionScale > 0 ? 'animate-fade-in' : ''
            }`}
            style={motionScale > 0 ? { animationDelay: '0.18s' } : undefined}
          >
            <div className="space-y-[6.854rem] sm:space-y-[11.09rem] lg:space-y-[17.944rem] pt-[4.236rem] sm:pt-[6.854rem]">
              <FeatureSection
                id="feature-chat"
                title={t('feature.review.title')}
                desc={t('feature.review.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { 
                    labelKey: 'subfeature.chatBase', 
                    descKey: 'subfeature.chatBaseDesc',
                    badge: '6',
                    details: ['subfeature.chatBase.d1', 'subfeature.chatBase.d2', 'subfeature.chatBase.d3', 'subfeature.chatBase.d4', 'subfeature.chatBase.d5', 'subfeature.chatBase.d6']
                  },
                  { 
                    labelKey: 'subfeature.blocks', 
                    descKey: 'subfeature.blocksDesc',
                    badge: '16',
                    details: ['subfeature.blocks.d1', 'subfeature.blocks.d2', 'subfeature.blocks.d3', 'subfeature.blocks.d4', 'subfeature.blocks.d5', 'subfeature.blocks.d6']
                  },
                  { 
                    labelKey: 'subfeature.agentTools', 
                    descKey: 'subfeature.agentToolsDesc',
                    badge: '6',
                    details: ['subfeature.agentTools.d1', 'subfeature.agentTools.d2', 'subfeature.agentTools.d3', 'subfeature.agentTools.d4', 'subfeature.agentTools.d5', 'subfeature.agentTools.d6']
                  },
                  { 
                    labelKey: 'subfeature.thinking', 
                    descKey: 'subfeature.thinkingDesc',
                    badge: '3',
                    details: ['subfeature.thinking.d1', 'subfeature.thinking.d2', 'subfeature.thinking.d3']
                  },
                  { 
                    labelKey: 'subfeature.multiModel', 
                    descKey: 'subfeature.multiModelDesc',
                    badge: '3',
                    details: ['subfeature.multiModel.d1', 'subfeature.multiModel.d2', 'subfeature.multiModel.d3']
                  },
                  { 
                    labelKey: 'subfeature.context', 
                    descKey: 'subfeature.contextDesc',
                    badge: '3',
                    details: ['subfeature.context.d1', 'subfeature.context.d2', 'subfeature.context.d3']
                  },
                ]}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl p-[1.75rem] sm:p-[2.75rem] rounded-[2rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] max-w-[18rem] sm:max-w-[30rem] mx-auto transform transition-all hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)] duration-500 ease-apple group">
              <div className={cardHeaderClass}>
                <div>
                  <div className="text-[15px] font-semibold text-[color:var(--apple-ink)] tracking-tight">{t('card.analyzing')}</div>
                  <div className="text-xs text-[color:var(--apple-muted)] font-medium mt-0.5">{t('card.justNow')}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-2.5 w-full bg-[color:var(--apple-line-strong)] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-[color:var(--apple-blue)] w-3/4 rounded-full shadow-[0_0_10px_rgba(0,113,227,0.4)] ${
                      motionScale > 0 ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
                <div className="flex justify-between text-xs text-[color:var(--apple-muted)] font-medium mt-1.5">
                  <span className="tracking-wide uppercase opacity-80">{t('card.mastery')}</span>
                  <span className="text-[color:var(--apple-ink)] font-bold">72%</span>
                </div>
                <div className="mt-[2.75rem] p-[1.5rem] bg-[color:var(--apple-card-strong)] rounded-[1.25rem] border border-[color:var(--apple-line)] text-[13px] sm:text-[14px] text-[color:var(--apple-muted)] leading-relaxed shadow-sm transition-colors group-hover:border-[color:var(--apple-line-strong)]">
                  <span className="font-semibold text-[color:var(--apple-ink)] block mb-1.5 text-[15px]">{t('card.suggestion')}</span>
                  {t('card.suggestionPrefix')}{' '}
                  <span className="text-[color:var(--apple-blue)] font-medium underline decoration-[color:var(--apple-blue-soft)] underline-offset-4 decoration-2">
                    {t('card.suggestionTopic')}
                  </span>{' '}
                  {t('card.suggestionSuffix')}
                </div>
              </div>
            </div>
          </FeatureSection>

          {/* ========== 笔记系统 ========== */}
          <FeatureSection
                id="feature-notes"
                title={t('feature.notes.title')}
                desc={t('feature.notes.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'notes.markdown', descKey: 'notes.markdownDesc', badge: '✓' },
                  { labelKey: 'notes.version', descKey: 'notes.versionDesc', badge: '20' },
                  { labelKey: 'notes.ai', descKey: 'notes.aiDesc', badge: '✓' },
                  { labelKey: 'notes.link', descKey: 'notes.linkDesc', badge: '✓' },
                ]}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl p-[1.75rem] sm:p-[2.75rem] rounded-[2rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] max-w-[18rem] sm:max-w-[30rem] mx-auto transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[color:var(--apple-blue)] flex items-center justify-center text-white text-sm">📝</div>
                <span className="text-[15px] font-semibold text-[color:var(--apple-ink)]">{t('notes.editor')}</span>
              </div>
              <div className="space-y-2 text-[13px] text-[color:var(--apple-muted)] font-mono bg-[color:var(--apple-card-strong)] p-4 rounded-xl border border-[color:var(--apple-line)]">
                <div><span className="text-[color:var(--apple-blue)]">#</span> {t('notes.sampleTitle')}</div>
                <div className="opacity-70">{t('notes.sampleContent')}</div>
                <div className="mt-3 pt-3 border-t border-[color:var(--apple-line)]">
                  <span className="text-[color:var(--apple-green)]">✓</span> {t('notes.autoSave')}
                </div>
              </div>
            </div>
          </FeatureSection>

          {/* ========== 教材管理 ========== */}
          <FeatureSection
                id="feature-textbook"
                title={t('feature.textbook.title')}
                desc={t('feature.textbook.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'textbook.formats', descKey: 'textbook.formatsDesc', badge: '16+' },
                  { labelKey: 'textbook.ocr', descKey: 'textbook.ocrDesc', badge: '2' },
                  { labelKey: 'textbook.reader', descKey: 'textbook.readerDesc', badge: '✓' },
                  { labelKey: 'textbook.search', descKey: 'textbook.searchDesc', badge: '✓' },
                ]}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[2rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] max-w-[18rem] sm:max-w-[30rem] mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
              <div className="px-6 py-4 border-b border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] flex items-center justify-between">
                <span className="text-[14px] font-medium text-[color:var(--apple-ink)]">{t('textbook.viewer')}</span>
                <div className="flex gap-2 text-[11px] text-[color:var(--apple-muted)]">
                  <span className="px-2 py-0.5 bg-[color:var(--apple-blue-soft)] text-[color:var(--apple-blue)] rounded">PDF</span>
                  <span className="px-2 py-0.5 bg-[color:var(--apple-card)] rounded">EPUB</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {['linear_algebra.pdf', 'calculus_notes.docx', 'physics_textbook.epub'].map((file, i) => (
                  <div key={file} className="flex items-center gap-3 p-3 bg-[color:var(--apple-card-strong)] rounded-xl hover:bg-[color:var(--apple-card-hover)] transition-colors">
                    <span className="text-lg">{i === 0 ? '📕' : i === 1 ? '📘' : '📗'}</span>
                    <span className="text-[13px] text-[color:var(--apple-ink)] flex-1 truncate">{file}</span>
                    <span className="text-[11px] text-[color:var(--apple-green)]">✓ {t('textbook.indexed')}</span>
                  </div>
                ))}
              </div>
            </div>
          </FeatureSection>

          {/* ========== 题目集/刷题 ========== */}
          <FeatureSection
                id="feature-qbank"
                title={t('feature.qbank.title')}
                desc={t('feature.qbank.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'qbank.ocr', descKey: 'qbank.ocrDesc', badge: '✓' },
                  { labelKey: 'qbank.modes', descKey: 'qbank.modesDesc', badge: '8' },
                  { labelKey: 'qbank.ai', descKey: 'qbank.aiDesc', badge: '✓' },
                  { labelKey: 'qbank.stats', descKey: 'qbank.statsDesc', badge: '✓' },
                  { labelKey: 'qbank.daily', descKey: 'qbank.dailyDesc', badge: '✓' },
                ]}
              >
            <div className="bg-gradient-to-br from-[#1c1c1e] to-[#000] text-white p-[1.75rem] sm:p-[2.75rem] rounded-[2rem] shadow-[var(--apple-shadow-xl)] max-w-[18rem] sm:max-w-[30rem] mx-auto transition-all duration-500 hover:scale-[1.02]">
              <div className="text-[12px] text-white/50 uppercase tracking-wider mb-2">{t('qbank.practiceMode')}</div>
              <div className="text-[1.5rem] font-bold mb-6">{t('qbank.randomPractice')}</div>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {['顺序', '随机', '错题', '限时'].map((mode, i) => (
                  <div key={mode} className={`p-2 rounded-lg text-center text-[11px] ${i === 1 ? 'bg-white text-black' : 'bg-white/10'}`}>
                    {mode}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <div className="text-[14px] font-medium">{t('qbank.currentQuestion')}</div>
                  <div className="text-[12px] text-white/60 mt-1">12 / 50</div>
                </div>
                <div className="text-[24px] font-bold text-[color:var(--apple-green)]">76%</div>
              </div>
            </div>
          </FeatureSection>

          {/* ========== 作文批改 ========== */}
          <FeatureSection
                id="feature-essay"
                title={t('feature.essay.title')}
                desc={t('feature.essay.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'essay.streaming', descKey: 'essay.streamingDesc', badge: '✓' },
                  { labelKey: 'essay.dimensions', descKey: 'essay.dimensionsDesc', badge: '✓' },
                  { labelKey: 'essay.suggestions', descKey: 'essay.suggestionsDesc', badge: '✓' },
                  { labelKey: 'essay.ocr', descKey: 'essay.ocrDesc', badge: '✓' },
                ]}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl p-[1.75rem] sm:p-[2.75rem] rounded-[2rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] max-w-[18rem] sm:max-w-[30rem] mx-auto transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[15px] font-semibold text-[color:var(--apple-ink)]">{t('essay.grading')}</span>
                <span className="px-3 py-1 bg-[color:var(--apple-green-soft)] text-[color:var(--apple-green)] rounded-full text-[12px] font-medium">85/100</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: t('essay.grammar'), score: 90 },
                  { label: t('essay.structure'), score: 85 },
                  { label: t('essay.content'), score: 80 },
                  { label: t('essay.vocabulary'), score: 88 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-[12px] text-[color:var(--apple-muted)] w-16">{item.label}</span>
                    <div className="flex-1 h-2 bg-[color:var(--apple-line)] rounded-full overflow-hidden">
                      <div className="h-full bg-[color:var(--apple-blue)] rounded-full" style={{ width: `${item.score}%` }} />
                    </div>
                    <span className="text-[12px] text-[color:var(--apple-ink)] font-medium w-8">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </FeatureSection>

          {/* ========== 翻译工作台 ========== */}
          <FeatureSection
                id="feature-translate"
                title={t('feature.translate.title')}
                desc={t('feature.translate.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'translate.languages', descKey: 'translate.languagesDesc', badge: '11' },
                  { labelKey: 'translate.compare', descKey: 'translate.compareDesc', badge: '✓' },
                  { labelKey: 'translate.ocr', descKey: 'translate.ocrDesc', badge: '✓' },
                  { labelKey: 'translate.tts', descKey: 'translate.ttsDesc', badge: '✓' },
                ]}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[2rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] max-w-[18rem] sm:max-w-[30rem] mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
              <div className="flex border-b border-[color:var(--apple-line)]">
                <div className="flex-1 p-4 text-center border-r border-[color:var(--apple-line)]">
                  <span className="text-[13px] text-[color:var(--apple-muted)]">🇨🇳 {t('translate.chinese')}</span>
                </div>
                <div className="flex-1 p-4 text-center">
                  <span className="text-[13px] text-[color:var(--apple-muted)]">🇺🇸 {t('translate.english')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-r border-[color:var(--apple-line)] text-[13px] text-[color:var(--apple-ink)]">
                  {t('translate.sampleSource')}
                </div>
                <div className="p-4 text-[13px] text-[color:var(--apple-blue)]">
                  {t('translate.sampleTarget')}
                </div>
              </div>
              <div className="p-3 bg-[color:var(--apple-card-strong)] border-t border-[color:var(--apple-line)] flex justify-center gap-4 text-[11px] text-[color:var(--apple-muted)]">
                <span>🎤 TTS</span>
                <span>📷 OCR</span>
                <span>📋 {t('translate.copy')}</span>
              </div>
            </div>
          </FeatureSection>

          {/* ========== 知识导图 ========== */}
          <FeatureSection
                id="feature-mindmap"
                title={t('feature.mindmap.title')}
                desc={t('feature.mindmap.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'mindmap.layouts', descKey: 'mindmap.layoutsDesc', badge: '6' },
                  { labelKey: 'mindmap.export', descKey: 'mindmap.exportDesc', badge: '6' },
                  { labelKey: 'mindmap.style', descKey: 'mindmap.styleDesc', badge: '✓' },
                  { labelKey: 'mindmap.ai', descKey: 'mindmap.aiDesc', badge: '✓' },
                ]}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl p-[1.75rem] sm:p-[2.75rem] rounded-[2rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] max-w-[18rem] sm:max-w-[30rem] mx-auto transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">🧠</span>
                <span className="text-[15px] font-semibold text-[color:var(--apple-ink)]">{t('mindmap.editor')}</span>
              </div>
              <div className="relative h-[180px] flex items-center justify-center">
                {/* 简化的思维导图示意 */}
                <div className="absolute w-24 h-10 bg-[color:var(--apple-blue)] rounded-xl flex items-center justify-center text-white text-[12px] font-medium">
                  {t('mindmap.center')}
                </div>
                <div className="absolute top-4 right-8 w-20 h-8 bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] rounded-lg flex items-center justify-center text-[11px] text-[color:var(--apple-ink)]">
                  {t('mindmap.branch1')}
                </div>
                <div className="absolute bottom-4 right-8 w-20 h-8 bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] rounded-lg flex items-center justify-center text-[11px] text-[color:var(--apple-ink)]">
                  {t('mindmap.branch2')}
                </div>
                <div className="absolute top-4 left-8 w-20 h-8 bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] rounded-lg flex items-center justify-center text-[11px] text-[color:var(--apple-ink)]">
                  {t('mindmap.branch3')}
                </div>
                <div className="absolute bottom-4 left-8 w-20 h-8 bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] rounded-lg flex items-center justify-center text-[11px] text-[color:var(--apple-ink)]">
                  {t('mindmap.branch4')}
                </div>
              </div>
            </div>
          </FeatureSection>

          {/* ========== 技能系统 ========== */}
          <FeatureSection
                id="feature-skills"
                title={t('feature.compare.title')}
                desc={t('feature.compare.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { 
                    labelKey: 'subfeature.instructionSkills', 
                    descKey: 'subfeature.instructionSkillsDesc',
                    badge: '4',
                    details: ['subfeature.instructionSkills.d1', 'subfeature.instructionSkills.d2', 'subfeature.instructionSkills.d3', 'subfeature.instructionSkills.d4']
                  },
                  { 
                    labelKey: 'subfeature.toolSkills', 
                    descKey: 'subfeature.toolSkillsDesc',
                    badge: '12',
                    details: ['subfeature.toolSkills.d1', 'subfeature.toolSkills.d2', 'subfeature.toolSkills.d3', 'subfeature.toolSkills.d4', 'subfeature.toolSkills.d5', 'subfeature.toolSkills.d6']
                  },
                  { 
                    labelKey: 'subfeature.builtinTools', 
                    descKey: 'subfeature.builtinToolsDesc',
                    badge: '59',
                    details: ['subfeature.builtinTools.d1', 'subfeature.builtinTools.d2', 'subfeature.builtinTools.d3', 'subfeature.builtinTools.d4', 'subfeature.builtinTools.d5', 'subfeature.builtinTools.d6']
                  },
                  { 
                    labelKey: 'subfeature.customSkills', 
                    descKey: 'subfeature.customSkillsDesc',
                    badge: '3',
                    details: ['subfeature.customSkills.d1', 'subfeature.customSkills.d2', 'subfeature.customSkills.d3']
                  },
                  { 
                    labelKey: 'subfeature.mcp', 
                    descKey: 'subfeature.mcpDesc',
                    badge: '4',
                    details: ['subfeature.mcp.d1', 'subfeature.mcp.d2', 'subfeature.mcp.d3', 'subfeature.mcp.d4']
                  },
                ]}
              >
            <div className="bg-gradient-to-br from-[#1c1c1e] via-[#151516] to-[#000000] dark:from-[#2c2c2e] dark:via-[#1c1c1e] dark:to-[#000000] text-white p-[1.75rem] sm:p-[2.75rem] rounded-[2rem] shadow-[var(--apple-shadow-xl)] border border-white/10 max-w-[18rem] sm:max-w-[30rem] mx-auto relative overflow-hidden group transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 blur-[80px] rounded-full pointer-events-none mix-blend-overlay" />
              <div className="relative z-10">
                <div className="text-[13px] text-white/50 mb-1.5 font-medium tracking-wide uppercase">{t('card.errorType')}</div>
                <div className="text-[1.75rem] font-bold mb-[2.5rem] tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">{t('card.calcError')}</div>
                <div className="space-y-[1.75rem]">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-white/60 font-medium">{t('card.frequency')}</span>
                    <span className="font-mono text-white/90">{t('card.high')} (8/10)</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white/90 h-full w-[80%] shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                  </div>
                  <div className="p-[1.25rem] bg-white/5 rounded-[1.25rem] text-[13px] text-white/80 border border-white/10 mt-[1.75rem] leading-relaxed backdrop-blur-sm">
                    {t('card.calcErrorTip')}
                  </div>
                </div>
              </div>
            </div>
          </FeatureSection>

          <FeatureSection
                id="feature-anki"
                title={t('feature.spaced.title')}
                desc={t('feature.spaced.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { 
                    labelKey: 'subfeature.ankiParse', 
                    descKey: 'subfeature.ankiParseDesc',
                    badge: '16+',
                    details: ['subfeature.ankiParse.d1', 'subfeature.ankiParse.d2', 'subfeature.ankiParse.d3']
                  },
                  { 
                    labelKey: 'subfeature.template', 
                    descKey: 'subfeature.templateDesc',
                    badge: '6+',
                    details: ['subfeature.template.d1', 'subfeature.template.d2', 'subfeature.template.d3', 'subfeature.template.d4', 'subfeature.template.d5', 'subfeature.template.d6']
                  },
                  { 
                    labelKey: 'subfeature.ankiTools', 
                    descKey: 'subfeature.ankiToolsDesc',
                    badge: '6',
                    details: ['subfeature.ankiTools.d1', 'subfeature.ankiTools.d2', 'subfeature.ankiTools.d3', 'subfeature.ankiTools.d4', 'subfeature.ankiTools.d5', 'subfeature.ankiTools.d6']
                  },
                  { 
                    labelKey: 'subfeature.ankiExport', 
                    descKey: 'subfeature.ankiExportDesc',
                    badge: '2',
                    details: ['subfeature.ankiExport.d1', 'subfeature.ankiExport.d2']
                  },
                  { 
                    labelKey: 'subfeature.preview3d', 
                    descKey: 'subfeature.preview3dDesc',
                    badge: '3',
                    details: ['subfeature.preview3d.d1', 'subfeature.preview3d.d2', 'subfeature.preview3d.d3']
                  },
                ]}
              >
            <div className="flex justify-center">
              <Flashcard motionScale={motionScale} />
            </div>
          </FeatureSection>

          <FeatureSection
                id="feature-privacy"
                title={t('feature.knowledge.title')}
                desc={t('feature.knowledge.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { 
                    labelKey: 'subfeature.databases', 
                    descKey: 'subfeature.databasesDesc',
                    badge: '4',
                    details: ['subfeature.databases.d1', 'subfeature.databases.d2', 'subfeature.databases.d3', 'subfeature.databases.d4']
                  },
                  { 
                    labelKey: 'subfeature.chatTables', 
                    descKey: 'subfeature.chatTablesDesc',
                    badge: '11',
                    details: ['subfeature.chatTables.d1', 'subfeature.chatTables.d2', 'subfeature.chatTables.d3', 'subfeature.chatTables.d4', 'subfeature.chatTables.d5', 'subfeature.chatTables.d6']
                  },
                  { 
                    labelKey: 'subfeature.vfsTables', 
                    descKey: 'subfeature.vfsTablesDesc',
                    badge: '27',
                    details: ['subfeature.vfsTables.d1', 'subfeature.vfsTables.d2', 'subfeature.vfsTables.d3', 'subfeature.vfsTables.d4', 'subfeature.vfsTables.d5', 'subfeature.vfsTables.d6']
                  },
                  { 
                    labelKey: 'subfeature.backup', 
                    descKey: 'subfeature.backupDesc',
                    badge: '4',
                    details: ['subfeature.backup.d1', 'subfeature.backup.d2', 'subfeature.backup.d3', 'subfeature.backup.d4']
                  },
                  { 
                    labelKey: 'subfeature.cloudSync', 
                    descKey: 'subfeature.cloudSyncDesc',
                    badge: '2',
                    details: ['subfeature.cloudSync.d1', 'subfeature.cloudSync.d2']
                  },
                ]}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl p-[1.75rem] sm:p-[2.75rem] rounded-[2rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] max-w-[18rem] sm:max-w-[30rem] mx-auto transition-transform duration-500 hover:scale-[1.02]">
              <div className="space-y-[1.75rem]">
                <div className="mb-[2rem]">
                  <div className="text-[16px] font-semibold text-[color:var(--apple-ink)] tracking-tight">Local-First</div>
                  <div className="text-xs text-[color:var(--apple-muted)] font-medium mt-0.5">Data Storage</div>
                </div>
                <div className="space-y-3.5">
                  {[
                    { label: 'SQLite', desc: 'Metadata & Config', status: '✓' },
                    { label: 'LanceDB', desc: 'Vector Store', status: '✓' },
                    { label: 'Blob Files', desc: 'Documents & Images', status: '✓' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-[1.1rem] bg-[color:var(--apple-card-strong)] rounded-[1.25rem] border border-[color:var(--apple-line)] hover:border-[color:var(--apple-line-strong)] transition-colors group">
                      <div>
                        <div className="text-[14px] font-medium text-[color:var(--apple-ink)]">{item.label}</div>
                        <div className="text-[11px] text-[color:var(--apple-muted)] mt-0.5">{item.desc}</div>
                      </div>
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--apple-blue)] text-white text-[10px] font-bold shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-[1.5rem] border-t border-[color:var(--apple-line)] text-[11px] font-medium text-[color:var(--apple-muted)] text-center tracking-wide uppercase opacity-70">
                  Backup · Audit · Export · Full Control
                </div>
              </div>
            </div>
          </FeatureSection>

          <FaqSection motionScale={motionScale} onOpenPolicy={handlePolicyOpen} />
        </div>
      </main>
      </>
    )}

    <Footer onOpenPolicy={handlePolicyOpen} />
    <PolicyModal type={activePolicy} onClose={handlePolicyClose} />
  </div>
)
}

const TopNav = ({ onDownload = () => {} }) => {
  const { isDark } = useTheme()
  const { t } = useLocale()
  return (
    <nav className="sticky top-0 z-40 border-b border-[color:var(--apple-nav-border)] bg-[color:var(--apple-nav-bg)] backdrop-blur-[20px] backdrop-saturate-[180%]">
      <div className="max-w-[980px] mx-auto flex items-center justify-between px-4 sm:px-6 h-12">
        <a href="/" className="flex items-center gap-2.5 font-semibold text-[color:var(--apple-ink)] hover:opacity-80 transition-opacity">
          <img src={isDark ? logoDark : logo} alt="" className="h-10 w-auto" />
          <span className="sr-only">DeepStudent</span>
        </a>
        <div className="flex items-center gap-4 text-[12px] text-[color:var(--apple-muted)] font-normal">
          <a href="#features" className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors hidden sm:inline">
            {t('nav.features')}
          </a>
          <a
            href="/docs/"
            className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors hidden sm:inline"
          >
            {t('nav.docs')}
          </a>
          <a
            href="#download"
            onClick={(e) => { e.preventDefault(); onDownload(); }}
            className="focus-ring text-[color:var(--apple-blue)] hover:text-[color:var(--apple-blue-hover)] transition-colors font-normal"
          >
            {t('nav.download')}
          </a>
        </div>
      </div>
    </nav>
  )
}

const HeroSection = ({ onDownload = () => {}, motionScale = 1 }) => {
  const scrollY = useScrollY()
  const { t } = useLocale()
  const motionAmount = Math.max(0, motionScale)
  const isStatic = motionAmount === 0
  const shouldAnimate = motionScale > 0
  const heroProgress = clamp(scrollY / 640, 0, 1)
  const heroEase = easeInOutCubic(heroProgress)
  const heroJuice = Math.sin(heroEase * Math.PI)
  const heroFade = 1 - heroEase * 0.55 * motionAmount
  const layerStyle2d = (offsetY) => ({
    transform: isStatic ? 'none' : `translate3d(0, ${offsetY}px, 0)`,
    opacity: heroFade,
    transformStyle: 'flat',
    willChange: isStatic ? 'auto' : 'transform, opacity',
  })
  // Lift the hero text slightly as we scroll, so it won't visually collide with the preview segmented control.
  const subtitleOffset = heroEase * (32 + heroJuice * 6) * motionAmount
  const textOffset = heroEase * (44 + heroJuice * 8) * motionAmount
  const ctaOffset = heroEase * (56 + heroJuice * 10) * motionAmount

  const previewOffset = heroEase * 80 * motionAmount
  const previewStyle = {
    transform: isStatic ? 'none' : `translate3d(0, ${previewOffset}px, 0)`,
    opacity: heroFade,
    transformStyle: 'flat',
    willChange: isStatic ? 'auto' : 'transform, opacity',
  }
  // Fade the preview image from bottom only when the hero is being "swiped away" (near the end of the scroll range).
  // Golden ratio details:
  // - start fading at ~85% scroll progress
  // - fade band height is 38.2% of the image height
  const previewMaskStart = 0.85
  const previewMaskT = clamp((heroProgress - previewMaskStart) / (1 - previewMaskStart), 0, 1)
  const previewMaskEase = easeInOutCubic(previewMaskT)
  const previewMaskAlpha = clamp(1 - previewMaskEase * motionAmount, 0, 1)
  const previewMaskImage = `linear-gradient(to top, rgba(0,0,0,${previewMaskAlpha}) 0%, rgba(0,0,0,1) 38.2%, rgba(0,0,0,1) 100%)`
  const previewImageMaskStyle = isStatic
    ? null
    : {
        WebkitMaskImage: previewMaskImage,
        maskImage: previewMaskImage,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
      }

  const handleExplore = () => {
    if (typeof document === 'undefined') return
    const target = document.getElementById('features')
    if (!target) return
    target.scrollIntoView({ behavior: shouldAnimate ? 'smooth' : 'auto', block: 'start' })
  }

  return (
    <header
      className="relative min-h-[85vh] min-h-[85svh] px-4 sm:px-6 pt-[3rem] pb-[3rem] sm:pt-[4rem] sm:pb-[5rem] flex items-center overflow-hidden"
    >
      {/* Apple-style dramatic background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {/* Primary glow - top center */}
        <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 h-[90vh] w-[140vw] rounded-[100%] bg-[radial-gradient(ellipse_at_center,var(--apple-glow),transparent_70%)] blur-[120px] opacity-60 dark:opacity-80 mix-blend-screen" />
        {/* Secondary accent - purple tint */}
        <div className="absolute top-[5%] -right-[10%] h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06),transparent_60%)] blur-[100px] dark:bg-[radial-gradient(circle_at_center,rgba(191,90,242,0.12),transparent_60%)] mix-blend-screen" />
        {/* Tertiary accent - left side */}
        <div className="absolute top-[15%] -left-[10%] h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,113,227,0.05),transparent_60%)] blur-[100px] dark:bg-[radial-gradient(circle_at_center,rgba(10,132,255,0.1),transparent_60%)] mix-blend-screen" />
        {/* Subtle ambient light overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color:var(--apple-surface)] opacity-80" />
      </div>
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center gap-16 sm:gap-20 ${
          shouldAnimate ? 'animate-fade-in' : ''
        }`}
        style={shouldAnimate ? { animationDelay: '0.08s' } : undefined}
      >
        <div className="flex flex-col items-center text-center max-w-3xl">
          <h1
            className="text-[1.75rem] sm:text-[2.5rem] md:text-[3.2rem] font-semibold tracking-[-0.02em] mb-[1rem] sm:mb-[1.25rem] leading-[1.15] font-display text-[color:var(--apple-ink)]"
            style={layerStyle2d(-subtitleOffset)}
          >
            {t('hero.subtitle')}
          </h1>

          <p
            className="text-[1.1rem] sm:text-[1.35rem] text-[color:var(--apple-muted)] max-w-2xl mb-[2.5rem] sm:mb-[3.25rem] leading-[1.6] font-display font-medium tracking-tight whitespace-pre-line"
            style={layerStyle2d(-textOffset)}
          >
            {t('hero.tagline')}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-5 w-full max-w-[18rem] sm:max-w-[28rem] justify-center"
            style={layerStyle2d(-ctaOffset)}
          >
            <button
              type="button"
              onClick={onDownload}
              className="focus-ring flex-1 py-[1rem] px-[1.75rem] sm:py-[1.1rem] sm:px-[2.2rem] bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] rounded-full font-semibold text-[15px] sm:text-[16px] hover:bg-[color:var(--apple-btn-primary-bg-hover)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-apple flex items-center justify-center gap-2 shadow-[var(--apple-shadow-lg)] hover:shadow-[var(--apple-shadow-xl)]"
            >
{t('hero.cta.download')}
            </button>
            <button
              type="button"
              onClick={handleExplore}
              className="focus-ring flex-1 py-[1rem] px-[1.75rem] sm:py-[1.1rem] sm:px-[2.2rem] bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-btn-secondary-text)] rounded-full font-semibold text-[15px] sm:text-[16px] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-[0.97] transition-all duration-300 ease-apple flex items-center justify-center gap-2 backdrop-blur-md"
            >
{t('hero.cta.explore')}
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <HeroPreview style={previewStyle} imageMaskStyle={previewImageMaskStyle} />
        </div>
      </div>
    </header>
  )
}

const heroPreviewItems = [
  {
    id: 'chat',
    labelKey: 'hero.preview.chat',
    src: '/img/hero-preview-overview.jpg',
    objectPosition: 'center 38.2%',
  },
  {
    id: 'skills',
    labelKey: 'hero.preview.skills',
    src: '/img/hero-preview-skills.jpg',
    objectPosition: 'center 38.2%',
  },
  {
    id: 'knowledge',
    labelKey: 'hero.preview.knowledge',
    src: '/img/hero-preview-mistakes.jpg',
    objectPosition: 'center 38.2%',
  },
  {
    id: 'providers',
    labelKey: 'hero.preview.providers',
    src: '/img/hero-preview-review.jpg',
    objectPosition: 'center 38.2%',
  },
]

const HeroPreview = ({ style, imageMaskStyle }) => {
  const { locale, t } = useLocale()
  const [activeId, setActiveId] = useState(heroPreviewItems[0].id)
  const activeItem = heroPreviewItems.find((item) => item.id === activeId) || heroPreviewItems[0]
  const activeLabel = t(activeItem.labelKey)
  const imageAlt = t('hero.preview.imageAlt', 'DeepStudent {label} preview (placeholder)', { label: activeLabel })
  const previewRef = useRef(null)
  const segmentedControlRef = useRef(null)
  const segmentedSliderRef = useRef(null)
  const autoplayTimerRef = useRef(null)

  const updateSegmentedSlider = useCallback(() => {
    const controlEl = segmentedControlRef.current
    const sliderEl = segmentedSliderRef.current
    if (!controlEl || !sliderEl) return

    const activeButton = controlEl.querySelector(`[data-segment-id="${activeId}"]`)
    if (!activeButton) return

    const rect = activeButton.getBoundingClientRect()
    const parentRect = controlEl.getBoundingClientRect()
    const paddingPx = 2
    const offset = rect.left - parentRect.left - paddingPx
    sliderEl.style.width = `${rect.width}px`
    sliderEl.style.transform = `translateX(${offset}px)`
  }, [activeId])

  useEffect(() => {
    heroPreviewItems.forEach((item) => {
      const img = new Image()
      img.src = item.src
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const shouldReduceMotion = Boolean(mediaQuery?.matches)

    const stop = () => {
      if (!autoplayTimerRef.current) return
      window.clearInterval(autoplayTimerRef.current)
      autoplayTimerRef.current = null
    }

    const start = () => {
      if (shouldReduceMotion) return
      stop()
      autoplayTimerRef.current = window.setInterval(() => {
        setActiveId((prev) => {
          const currentIndex = heroPreviewItems.findIndex((item) => item.id === prev)
          const safeIndex = currentIndex >= 0 ? currentIndex : 0
          const nextIndex = (safeIndex + 1) % heroPreviewItems.length
          return heroPreviewItems[nextIndex].id
        })
      }, 20000)
    }

    // 默认开启动画，但在离屏时暂停（减少无意义的循环定时器）。
    let isVisible = true
    const el = previewRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      isVisible = rect.bottom > 0 && rect.top < window.innerHeight
    }
    if (isVisible) start()

    let observer
    if (typeof IntersectionObserver !== 'undefined' && el) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          const nextVisible = Boolean(entry?.isIntersecting)
          if (nextVisible) start()
          else stop()
        },
        { threshold: 0.2 },
      )
      observer.observe(el)
    }

    return () => {
      stop()
      observer?.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    updateSegmentedSlider()
  }, [updateSegmentedSlider, locale])

  // Fix: Re-calculate slider after initial render when fonts/layout are fully ready
  useEffect(() => {
    // Use requestAnimationFrame to wait for next paint cycle
    const rafId = requestAnimationFrame(() => {
      updateSegmentedSlider()
    })
    // Also handle font loading completion
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        updateSegmentedSlider()
      })
    }
    return () => cancelAnimationFrame(rafId)
  }, [updateSegmentedSlider])

  useEffect(() => {
    window.addEventListener('resize', updateSegmentedSlider)
    return () => window.removeEventListener('resize', updateSegmentedSlider)
  }, [updateSegmentedSlider])

  return (
    <div
      ref={previewRef}
      className="relative w-full max-w-[24rem] sm:max-w-[52rem] lg:max-w-[64rem]"
      style={style}
    >
      <div className="relative p-2 sm:p-3 bg-white/20 dark:bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[var(--apple-shadow-2xl)] border border-white/20 dark:border-white/10">
        <div className="relative rounded-[2rem] overflow-hidden shadow-inner bg-black">
          {/* Golden ratio (phi) ~ 1.618:1 */}
          <div className="relative aspect-[1618/1000] bg-[color:var(--apple-card-strong)]">
            <img
              src={activeItem.src}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              style={{
                objectPosition: activeItem.objectPosition || 'center',
                ...(imageMaskStyle || {}),
              }}
              loading="lazy"
              draggable="false"
            />
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 flex justify-center -translate-y-1/2 px-3 sm:px-4 z-20">
          <div
            ref={segmentedControlRef}
            className="segmented-control shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 dark:border-white/10"
            role="group"
            aria-label={t('hero.preview.selector', 'Preview selector')}
          >
            <div
              ref={segmentedSliderRef}
              className="segmented-control__slider shadow-sm"
              aria-hidden="true"
            />
            {heroPreviewItems.map((item) => {
              const isActive = item.id === activeId
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  data-segment-id={item.id}
                  className={`segmented-control__btn focus-ring${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  aria-label={t(item.labelKey)}
                  title={t(item.labelKey)}
                >
                  <span className="relative z-10">{t(item.labelKey)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const DownloadPage = ({ onBack = () => {} }) => {
  const { t } = useLocale()
  const platformDownloads = [
    {
      id: 'mac',
      platform: 'macOS',
      channel: t('download.dmgInstall'),
      version: 'v1.0.2 · Build 88',
      size: '312 MB',
      requirements: t('download.requirements.macos'),
      description: t('download.description.macos'),
      ctaLabel: t('download.downloadDmg'),
      ctaHref: 'https://downloads.deepstudent.ai/macos/deepstudent-v1.0.2.dmg',
    },
    {
      id: 'windows',
      platform: 'Windows',
      channel: t('download.preview'),
      version: 'v0.9.8 Preview',
      size: '298 MB',
      requirements: t('download.requirements.windows', 'Windows 11 / 10 22H2+'),
      description: t('download.description.windows'),
      ctaLabel: t('download.downloadExe'),
      ctaHref: 'https://downloads.deepstudent.ai/windows/deepstudent-setup.exe',
    },
  ]
  return (
    <div className="relative min-h-screen min-h-[100svh] bg-transparent pb-[6.854rem] sm:pb-[11.09rem]">
      <div className="sticky top-0 z-40 border-b border-[color:var(--apple-line)] bg-[color:var(--apple-nav-bg)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <button
            type="button"
            onClick={onBack}
            className="focus-ring inline-flex items-center gap-2 text-sm font-medium text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
          >
← {t('download.backHome')}
          </button>
          <div className="flex items-center gap-3">
            <LocaleToggle />
            <ThemeToggle />
            <span className="text-xs text-[color:var(--apple-muted)]">{t('nav.download')}</span>
          </div>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-[3.236rem] sm:pt-[4.236rem] md:pt-[5.854rem] text-center">
        <h1 className="text-[2.2rem] sm:text-[3.2rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          {t('download.title')}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--apple-muted)] max-w-md mx-auto">
          {t('download.subtitle')}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-[3.236rem] sm:pt-[4.236rem]">
        <h2 className="text-[1.3rem] sm:text-[1.9rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          {t('download.selectPlatform')}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {platformDownloads.map((platform) => (
              <article
                key={platform.id}
                className="rounded-[1.5rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] p-[1.5rem] sm:p-[1.75rem] shadow-[var(--apple-shadow-sm)]"
              >
                <div>
                  <p className="text-base font-semibold text-[color:var(--apple-ink)]">{platform.platform}</p>
                  <p className="text-xs text-[color:var(--apple-muted)]">{platform.channel}</p>
                </div>

                <p className="mt-3 text-sm text-[color:var(--apple-muted)] leading-relaxed">{platform.description}</p>

                <div className="mt-4 text-xs text-[color:var(--apple-muted)] flex flex-wrap gap-x-3 gap-y-1">
                  <span>{t('download.version')} {platform.version}</span>
                  <span>{t('download.size')} {platform.size}</span>
                  <span>{t('download.system')} {platform.requirements}</span>
                </div>

                <div className="mt-4">
                  <a
                    href={platform.ctaHref}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--apple-btn-primary-bg)] px-4 py-2 text-xs font-medium text-[color:var(--apple-btn-primary-text)] hover:bg-[color:var(--apple-btn-primary-bg-hover)] active:scale-95 transition-all shadow-[var(--apple-shadow-sm)]"
                  >
{platform.ctaLabel}
                  </a>
                </div>
              </article>
          ))}
        </div>

        <p className="mt-6 text-xs text-[color:var(--apple-muted)]">
          {t('download.note.windowsPreview')}
        </p>
      </section>
    </div>
  )
}

const FaqSection = ({ motionScale = 1, onOpenPolicy = () => {} }) => {
  const shouldAnimate = motionScale > 0
  const { t } = useLocale()
  const faqItems = [
    {
      id: 'open-source',
      question: t('faq.openSource.q'),
      answer: t('faq.openSource.a'),
      linkHref: 'https://github.com/deepstudents/ai-mistake-manager',
      linkLabel: t('faq.openSource.link'),
    },
    {
      id: 'privacy',
      question: t('faq.privacy.q'),
      answer: t('faq.privacy.a'),
      actionLabel: t('faq.privacy.action'),
      onAction: () => onOpenPolicy('privacy'),
    },
    {
      id: 'macos-quarantine',
      question: t('faq.macosQuarantine.q'),
      answer: t('faq.macosQuarantine.a'),
      code: t('faq.macosQuarantine.code', 'sudo xattr -r -d com.apple.quarantine <App Path>'),
      linkHref: '/docs/guide/A-Q',
      linkLabel: t('faq.macosQuarantine.link'),
    },
    {
      id: 'windows-preview',
      question: t('faq.windowsPreview.q'),
      answer: t('faq.windowsPreview.a'),
    },
  ]

  return (
    <section
      id="qa"
      className={`px-4 sm:px-6 max-w-4xl mx-auto py-[2.618rem] sm:py-[4.236rem] md:py-[6.854rem] ${
        shouldAnimate ? 'animate-fade-in' : ''
      }`}
      style={shouldAnimate ? { animationDelay: '0.12s' } : undefined}
    >
      <div className="text-center">
        <h2 className="text-[1.618rem] sm:text-[2.618rem] font-semibold text-[color:var(--apple-ink)] mb-[0.618rem] tracking-[-0.02em] font-display">
          {t('faq.title')}
        </h2>
        <p className="text-sm sm:text-base text-[color:var(--apple-muted)] leading-relaxed">
          {t('faq.subtitle')}
        </p>
      </div>

      <div className="mt-[3rem] space-y-4">
        {faqItems.map((item) => (
          <details
            key={item.id}
            className="group rounded-[1.75rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-sm)] overflow-hidden transition-all duration-300 hover:shadow-[var(--apple-shadow-md)] open:bg-[color:var(--apple-card-strong)] open:shadow-[var(--apple-shadow-lg)]"
          >
            <summary className="focus-ring flex items-center justify-between gap-4 p-[1.5rem] sm:p-[1.75rem] cursor-pointer select-none [&::-webkit-details-marker]:hidden">
              <span className="text-[15px] sm:text-[17px] font-semibold text-[color:var(--apple-ink)] tracking-tight">
                {item.question}
              </span>
              <span
                className="text-[color:var(--apple-muted)] transition-transform duration-300 ease-apple group-open:rotate-180 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[color:var(--apple-btn-secondary-bg)] group-hover:bg-[color:var(--apple-btn-secondary-bg-hover)]"
                aria-hidden="true"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </summary>

            <div className="px-[1.5rem] sm:px-[1.75rem] pb-[1.5rem] sm:pb-[1.75rem] text-[15px] text-[color:var(--apple-muted)] leading-relaxed animate-fade-in">
              <p>{item.answer}</p>

              {item.code ? (
                <pre className="mt-4 rounded-[1rem] bg-[color:var(--apple-surface)] border border-[color:var(--apple-line)] p-4 overflow-x-auto text-[13px] shadow-inner">
                  <code className="font-mono text-[color:var(--apple-ink)]">{item.code}</code>
                </pre>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {item.actionLabel ? (
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-5 py-2.5 text-[13px] font-semibold text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-95 transition-all"
                  >
                    {item.actionLabel}
                  </button>
                ) : null}
                {item.linkHref ? (
                  <a
                    href={item.linkHref}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-5 py-2.5 text-[13px] font-semibold text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-95 transition-all"
                    target={item.linkHref.startsWith('http') ? '_blank' : undefined}
                    rel={item.linkHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {item.linkLabel}
                  </a>
                ) : null}
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

// 子功能卡片组件 - 支持展开详情
const SubFeatureCard = ({ sf, t, index, shouldAnimate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasDetails = sf.details && sf.details.length > 0

  return (
    <div
      className={`bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] rounded-[1rem] overflow-hidden transition-all duration-300 group ${
        isExpanded ? 'shadow-[var(--apple-shadow-lg)] border-[color:var(--apple-line-strong)]' : 'hover:border-[color:var(--apple-line-strong)] hover:shadow-sm'
      }`}
      style={shouldAnimate ? { animationDelay: `${index * 0.05}s` } : undefined}
    >
      <button
        type="button"
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={`w-full text-left p-3 sm:p-4 flex items-start gap-2.5 ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`}
      >
        {/* 徽章 */}
        {sf.badge && (
          <span className="flex-shrink-0 min-w-[1.75rem] h-[1.375rem] px-1.5 rounded-full bg-[color:var(--apple-blue)] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {sf.badge}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] sm:text-[14px] font-semibold text-[color:var(--apple-ink)] group-hover:text-[color:var(--apple-blue)] transition-colors">
              {t(sf.labelKey)}
            </span>
            {hasDetails && (
              <svg 
                className={`w-3 h-3 text-[color:var(--apple-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 12 12" 
                fill="none"
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="text-[11px] sm:text-[12px] text-[color:var(--apple-muted)] leading-relaxed mt-0.5">
            {t(sf.descKey)}
          </div>
        </div>
      </button>
      
      {/* 展开的详情列表 */}
      {hasDetails && isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 border-t border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)]">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {sf.details.map((detailKey, i) => (
              <span 
                key={i}
                className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[color:var(--apple-surface)] border border-[color:var(--apple-line)] rounded-full text-[10px] sm:text-[11px] text-[color:var(--apple-muted)] font-medium"
              >
                {t(detailKey)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const FeatureSection = ({ id, title, desc, align, children, motionScale = 1, subFeatures = [] }) => {
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
  const depthBase = (0.5 - easedProgress) * 170 * motionAmount
  const depthFocus = 0.55 + juice * 0.45
  const mediaDepth = depthBase * depthFocus + 150 * motionAmount * depthFocus
  const mediaTilt = (0.5 - easedProgress) * 9 * motionAmount * depthFocus
  const mediaRotate = offset * 1.6
  const mediaScale = 1 + juice * 0.03 * motionAmount
  const opacity = isStatic ? 1 : 0.14 + reveal * 0.86

  return (
    <section ref={ref} id={id} className="px-4 sm:px-6 max-w-5xl mx-auto py-[3rem] sm:py-[5rem] md:py-[8rem] scroll-mt-28">
      <div className={`flex flex-col ${contentDirection} items-center gap-[3rem] sm:gap-[5rem] md:gap-[8rem]`}>
        <div
          className="flex-1 text-center md:text-left"
          style={{
            transform: isStatic ? 'none' : `translate3d(0, ${textShift}px, 0)`,
            opacity,
            transformStyle: 'flat',
            willChange: shouldAnimate ? 'transform, opacity' : 'auto',
          }}
        >
          <h2 className="text-[2rem] sm:text-[3rem] font-semibold text-[color:var(--apple-ink)] mb-[1.5rem] tracking-tight font-display leading-[1.1]">
            {title}
          </h2>
          <p className="text-[color:var(--apple-muted)] leading-[1.6] text-[1.1rem] sm:text-[1.35rem] font-medium tracking-tight max-w-lg mx-auto md:mx-0">{desc}</p>
          
          {/* 子功能列表 - 细粒度展示 */}
          {subFeatures.length > 0 && (
            <div className="mt-[2rem] sm:mt-[2.5rem] space-y-2 sm:space-y-3 max-w-lg mx-auto md:mx-0">
              {subFeatures.map((sf, index) => (
                <SubFeatureCard 
                  key={sf.labelKey} 
                  sf={sf} 
                  t={t} 
                  index={index}
                  shouldAnimate={shouldAnimate}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className="flex-1 w-full"
          style={{
            transform: isStatic
              ? 'none'
              : `perspective(1200px) translate3d(0, ${mediaShift}px, ${mediaDepth}px) rotateX(${mediaTilt}deg) rotateZ(${mediaRotate}deg) scale3d(${mediaScale}, ${mediaScale}, ${mediaScale})`,
            opacity,
            transformStyle: shouldAnimate ? 'preserve-3d' : 'flat',
            willChange: shouldAnimate ? 'transform, opacity' : 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

const Flashcard = ({ motionScale = 1 }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const shouldAnimate = motionScale > 0
  const { t } = useLocale()

  return (
    <div
      className={`bg-[color:var(--apple-card)] backdrop-blur-2xl border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] rounded-[2rem] p-[1.75rem] sm:p-[2.75rem] w-[18rem] aspect-[1/1.6] flex flex-col items-center text-center justify-center relative rotate-1 ${
        shouldAnimate ? 'transition-all duration-700 ease-apple' : ''
      } hover:rotate-0 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]`}
    >
      <div className="absolute top-[2rem] left-[2rem] w-3 h-3 bg-[color:var(--apple-ink)] rounded-full opacity-20" />
      <div
        className={`absolute inset-0 bg-[color:var(--apple-card-strong)] backdrop-blur-md flex items-center justify-center rounded-[2rem] ${
          shouldAnimate ? 'transition-all duration-500' : ''
        } ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isFlipped}
      >
        <div className="text-3xl font-bold text-[color:var(--apple-ink)] tracking-tight">1 / x</div>
      </div>
      <div
        className={`relative z-10 flex flex-col items-center ${
          shouldAnimate ? 'transition-all duration-500' : ''
        } ${isFlipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        aria-hidden={isFlipped}
      >
        <div className="text-[11px] font-bold text-[color:var(--apple-muted)] tracking-[0.2em] uppercase mb-[1rem]">
          {t('card.question')}
        </div>
        <div className="text-[1.75rem] font-sans font-medium text-[color:var(--apple-ink)] tracking-tight">
          {t('flashcard.prompt')}
        </div>
      </div>
      <div className="w-full h-px bg-[color:var(--apple-line)] my-[3rem]" />
      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className="focus-ring relative z-20 text-[13px] text-[color:var(--apple-muted)] font-semibold px-4 py-2 rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] hover:text-[color:var(--apple-ink)] hover:border-[color:var(--apple-line-strong)] hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm"
        aria-pressed={isFlipped}
      >
        {isFlipped ? t('card.backToQuestion') : t('card.clickAnswer')}
      </button>
    </div>
  )
}

const PolicyModal = ({ type, onClose }) => {
  const { t } = useLocale()
  const data = type ? getPolicyContent(t)[type] : null
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const titleId = type ? `policy-${type}-title` : undefined
  const descriptionId = type ? `policy-${type}-description` : undefined

  useEffect(() => {
    if (!type) return
    const previousActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const getFocusableElements = () => {
      if (!dialogRef.current) return []
      return Array.from(
        dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
    }

    const focusInitial = () => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
        return
      }
      const focusables = getFocusableElements()
      if (focusables.length) focusables[0].focus()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusables = getFocusableElements()
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    focusInitial()
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousActiveElement?.focus) previousActiveElement.focus()
    }
  }, [type, onClose])

  if (!type || !data) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl max-h-[80vh] max-h-[80svh] overflow-y-auto bg-[color:var(--apple-card)] backdrop-blur-xl border border-[color:var(--apple-line)] rounded-[2.618rem] shadow-[var(--apple-shadow-xl)] p-[1.618rem] sm:p-[2.618rem]"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-[2.618rem] mb-[2.618rem]">
          <div>
            <h3
              id={titleId}
              className="text-2xl font-semibold text-[color:var(--apple-ink)] mb-3 font-display"
            >
              {data.title}
            </h3>
            <p id={descriptionId} className="text-sm text-[color:var(--apple-muted)] leading-relaxed">
              {data.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex-shrink-0 w-[2.618rem] h-[2.618rem] rounded-full border border-[color:var(--apple-line)] text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] hover:border-[color:var(--apple-line-strong)] flex items-center justify-center transition-colors bg-[color:var(--apple-card-strong)]"
            aria-label={t('policy.close', 'Close dialog')}
            ref={closeButtonRef}
          >
            <span className="text-lg leading-none" aria-hidden="true">×</span>
          </button>
        </div>

        <div className="space-y-6">
          {data.sections.map((section) => (
            <div key={section.title} className="border border-[color:var(--apple-line)] rounded-[1.618rem] p-[1.618rem] bg-[color:var(--apple-card-strong)]">
              <h4 className="text-sm font-semibold text-[color:var(--apple-ink)] mb-2 font-display">
                {section.title}
              </h4>
              <p className="text-sm text-[color:var(--apple-muted)] leading-relaxed">{section.body}</p>
              {section.points?.length ? (
                <ul className="mt-3 space-y-1.5 text-sm text-[color:var(--apple-muted)] list-disc list-inside">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>

        {data.footer ? <p className="mt-8 text-xs text-[color:var(--apple-muted)] leading-relaxed">{data.footer}</p> : null}
        <button
          type="button"
          onClick={onClose}
          className="focus-ring mt-6 w-full py-[0.95rem] sm:py-[1.15rem] md:py-[1.35rem] rounded-[1.618rem] bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] text-sm md:text-base font-semibold hover:bg-[color:var(--apple-btn-primary-bg-hover)] active:scale-[0.98] transition-all shadow-[var(--apple-shadow-md)]"
        >
          {t('policy.understood', 'I Understand')}
        </button>
      </div>
    </div>
  )
}

const Footer = ({ onOpenPolicy = () => {} }) => {
  const { isDark } = useTheme()
  const { t } = useLocale()
  return (
    <footer className="border-t border-[color:var(--apple-line)] mt-32 bg-[color:var(--apple-card)] backdrop-blur-2xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col gap-10 sm:gap-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto] md:gap-16 items-start">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3 font-bold text-[color:var(--apple-ink)] text-lg tracking-tight">
                <img src={isDark ? logoDark : logo} alt="" className="h-11 w-auto" />
                <span className="sr-only">DeepStudent</span>
              </div>
            </div>
            <nav
              className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-[13px] text-[color:var(--apple-muted)] font-medium"
              aria-label="Footer links"
            >
              <button
                type="button"
                onClick={() => onOpenPolicy('privacy')}
                className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors"
              >
                {t('footer.privacy')}
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('about')}
                className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors"
              >
                {t('footer.about')}
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('terms')}
                className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors"
              >
                {t('footer.terms')}
              </button>
              <a
                href="https://github.com/deepstudents/ai-mistake-manager"
                className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </nav>
          </div>

          <div className="h-px bg-[color:var(--apple-line)]" aria-hidden="true" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a
              href="https://deepstudent.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center justify-center w-10 h-10 rounded-full bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-ink-secondary)] border border-[color:var(--apple-line)] backdrop-blur-xl transition duration-300 ease-apple hover:bg-[color:var(--apple-btn-secondary-bg-hover)] hover:text-[color:var(--apple-ink)] hover:scale-105 active:scale-95 self-center sm:self-auto"
              aria-label={t('footer.xiaohongshu', 'Xiaohongshu')}
              title={t('footer.xiaohongshu', 'Xiaohongshu')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M6.34 14.458c.106-.231.195-.431.29-.628q.329-.607.59-1.247a.74.74 0 0 1 .88-.55c.557.039 1.116.01 1.698.01V4.794c-.391 0-.777-.014-1.16 0-.267.014-.36-.073-.353-.36.019-.685 0-1.374 0-2.091h5.428v1.664c0 .783 0 .783-.76.783h-.762v7.245h1.647c.664 0 .664 0 .664.697v1.46c0 .202-.05.305-.268.305q-3.866-.007-7.73-.006a1 1 0 0 1-.164-.034"
                />
                <path
                  fill="currentColor"
                  d="M7.365 9.21c-.339.7-.637 1.324-.95 1.938a.3.3 0 0 1-.228.114c-.755 0-1.514.03-2.266-.026-.753-.056-1.054-.54-.754-1.28.342-.853.753-1.678 1.134-2.514.024-.053.042-.106.088-.223-.305 0-.572.007-.84 0a3 3 0 0 1-.646-.06.76.76 0 0 1-.652-.85.8.8 0 0 1 .074-.256c.457-1.098.97-2.175 1.464-3.256q.24-.532.51-1.05c.047-.09.155-.203.238-.207.706-.017 1.414-.009 2.184-.009-.067.172-.104.29-.156.399q-.648 1.356-1.301 2.709c-.088.183-.194.373.134.512.088-.47.44-.384.75-.384h1.784c-.075.178-.123.302-.178.42-.55 1.152-1.11 2.294-1.653 3.444-.223.469-.148.583.37.588.268-.008.538-.01.894-.01m-.97 2.834c-.419.839-.792 1.593-1.175 2.343a.26.26 0 0 1-.194.11 228 228 0 0 1-3.084-.058 2 2 0 0 1-.413-.11l.575-1.162c.188-.384.37-.767.572-1.133a.35.35 0 0 1 .247-.162c.942.047 1.884.112 2.828.17.19.01.369.002.644.002"
                />
              </svg>
            </a>
            <div className="flex flex-col items-center sm:items-end gap-2 text-[color:var(--apple-muted)]">
              <LocaleToggle compact className="w-[8.5rem]" />
              <span className="font-mono text-[10px] tracking-[0.08em] text-center sm:text-right opacity-60">
                Build {buildHash}
              </span>
              <span className="text-[11px] text-center sm:text-right opacity-80">© 2026 DeepStudent Team.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default App
