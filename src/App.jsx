import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ThemeToggle, useTheme } from './components/theme-toggle'
import { LocaleToggle, useLocale } from './components/locale-toggle'

const logo = '/logo_mono_svg.svg'
const logoFooter = '/logo-r.svg'
const logoFooterDark = '/logo-r-dark.svg'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const stretchProgress = (value, stretch = 1.3) => clamp((value - 0.5) / stretch + 0.5, 0, 1)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const buildHash = import.meta.env.VITE_BUILD_HASH || 'dev'

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
          t('policy.about.section1.point3', ''),
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
          t('policy.privacy.section1.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section2.title', ''),
        body: t('policy.privacy.section2.body', ''),
        points: [
          t('policy.privacy.section2.point1', ''),
          t('policy.privacy.section2.point2', ''),
          t('policy.privacy.section2.point3', ''),
          t('policy.privacy.section2.point4', ''),
          t('policy.privacy.section2.point5', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section3.title', ''),
        body: t('policy.privacy.section3.body', ''),
        points: [
          t('policy.privacy.section3.point1', ''),
          t('policy.privacy.section3.point2', ''),
          t('policy.privacy.section3.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section4.title', ''),
        body: t('policy.privacy.section4.body', ''),
        points: [
          t('policy.privacy.section4.point1', ''),
          t('policy.privacy.section4.point2', ''),
          t('policy.privacy.section4.point3', ''),
          t('policy.privacy.section4.point4', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section5.title', ''),
        body: t('policy.privacy.section5.body', ''),
        points: [
          t('policy.privacy.section5.point1', ''),
          t('policy.privacy.section5.point2', ''),
          t('policy.privacy.section5.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section6.title', ''),
        body: t('policy.privacy.section6.body', ''),
        points: [
          t('policy.privacy.section6.point1', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section7.title', ''),
        body: t('policy.privacy.section7.body', ''),
        points: [
          t('policy.privacy.section7.point1', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section8.title', ''),
        body: t('policy.privacy.section8.body', ''),
        points: [
          t('policy.privacy.section8.point1', ''),
          t('policy.privacy.section8.point2', ''),
        ].filter(Boolean),
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
        points: [t('policy.terms.section1.point1', '')].filter(Boolean),
      },
      {
        title: t('policy.terms.section2.title', ''),
        body: t('policy.terms.section2.body', ''),
        points: [t('policy.terms.section2.point1', '')].filter(Boolean),
      },
      {
        title: t('policy.terms.section3.title', ''),
        body: t('policy.terms.section3.body', ''),
        points: [t('policy.terms.section3.point1', '')].filter(Boolean),
      },
    ],
    footer: t('policy.terms.footer', ''),
  },
})

// 功能标签导航组件
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
      <div className="max-w-[90rem] mx-auto">
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
    <div className="min-h-screen min-h-[100svh] bg-transparent text-[color:var(--apple-ink)] font-sans selection:bg-black selection:text-white">
      {isDownloadPage ? (
        <DownloadPage onBack={handleDownloadClose} />
      ) : (
        <>
          <TopNav onDownload={handleDownloadOpen} />
          <HeroSection onDownload={handleDownloadOpen} motionScale={motionScale} />

          {/* 数据亮点区块 */}
          <StatsHighlight motionScale={motionScale} />

          <main
            id="features"
            className={`relative z-10 scroll-mt-24 pb-8 sm:pb-10 lg:pb-12 ${
              motionScale > 0 ? 'animate-fade-in' : ''
            }`}
            style={motionScale > 0 ? { animationDelay: '0.18s' } : undefined}
          >
            <div className="space-y-[6.854rem] sm:space-y-[11.09rem] lg:space-y-[17.944rem] pt-[4.236rem] sm:pt-[6.854rem]">
              <FeatureSection
                id="feature-free-models"
                title={t('freeModels.title', '免费模型，开箱即用')}
                desc={t('freeModels.desc', '合作伙伴免费提供的 AI 模型，无需 API Key，下载即用。')}
                align="right"
                motionScale={motionScale}
              >
                <div className="max-w-lg mx-auto">
                  <FreeModelsCallout />
                </div>
              </FeatureSection>

              {/* Module 1: AI 智能体 · 全能助手 */}
              <FeatureSection
                id="feature-agent"
                layout="sticky"
                title={t('feature.agent.title')}
                desc={t('feature.agent.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'agent.multiModel', descKey: 'agent.multiModelDesc', imgSrc: '/img/example/模型分配.png' },
                  { labelKey: 'agent.skills', descKey: 'agent.skillsDesc', imgSrc: '/img/example/技能管理.png' },
                  { labelKey: 'agent.group', descKey: 'agent.groupDesc', imgSrc: '/img/example/分组.png' },
                  { labelKey: 'agent.session', descKey: 'agent.sessionDesc', imgSrc: '/img/example/会话浏览.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/主页面.png" alt="AI Agent Interface" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

              {/* Module 2: Anki 智能制卡 */}
              <FeatureSection
                id="feature-anki"
                layout="sticky"
                title={t('feature.anki_full.title')}
                desc={t('feature.anki_full.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'anki.upload', descKey: 'anki.uploadDesc', imgSrc: '/img/example/anki-发送.png' },
                  { labelKey: 'anki.preview', descKey: 'anki.previewDesc', imgSrc: '/img/example/anki-制卡2.png' },
                  { labelKey: 'anki.import', descKey: 'anki.importDesc', imgSrc: '/img/example/anki-制卡3.png' },
                  { labelKey: 'anki.tasks', descKey: 'anki.tasksDesc', imgSrc: '/img/example/制卡任务.png' },
                  { labelKey: 'anki.templates', descKey: 'anki.templatesDesc', imgSrc: '/img/example/模板管理.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/anki-制卡1.png" alt="Anki Smart CardForge" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

              {/* Module 3: MCP 工具生态 */}
              <FeatureSection
                id="feature-mcp"
                title={t('feature.mcp.title')}
                desc={t('feature.mcp.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'mcp.context7', descKey: 'mcp.context7Desc', imgSrc: '/img/example/mcp-1.png' },
                  { labelKey: 'mcp.arxiv', descKey: 'mcp.arxivDesc', imgSrc: '/img/example/mcp-3.png' },
                  { labelKey: 'mcp.output', descKey: 'mcp.outputDesc', imgSrc: '/img/example/mcp-4.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/mcp-2.png" alt="MCP Tool Ecosystem" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

              {/* Module 4: 深度调研 */}
              <FeatureSection
                id="feature-research"
                layout="sticky"
                title={t('feature.research.title')}
                desc={t('feature.research.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'research.execute', descKey: 'research.executeDesc', imgSrc: '/img/example/调研-2.png' },
                  { labelKey: 'research.progress', descKey: 'research.progressDesc', imgSrc: '/img/example/调研-3.png' },
                  { labelKey: 'research.report', descKey: 'research.reportDesc', imgSrc: '/img/example/调研-4.png' },
                  { labelKey: 'research.save', descKey: 'research.saveDesc', imgSrc: '/img/example/调研-5.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/调研-1.png" alt="Deep Research" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

              {/* Module 5: 深度阅读 */}
              <FeatureSection
                id="feature-reading"
                title={t('feature.reading.title')}
                desc={t('feature.reading.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'reading.pdfSelect', descKey: 'reading.pdfSelectDesc', imgSrc: '/img/example/pdf阅读-2.png' },
                  { labelKey: 'reading.pdfDeep', descKey: 'reading.pdfDeepDesc', imgSrc: '/img/example/pdf阅读-3.png' },
                  { labelKey: 'reading.docx', descKey: 'reading.docxDesc', imgSrc: '/img/example/docx阅读-1.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/pdf阅读-1.png" alt="Deep Reading" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

              {/* Module 6: 知识导图 */}
              <FeatureSection
                id="feature-mindmap"
                layout="sticky"
                title={t('feature.mindmap.title')}
                desc={t('feature.mindmap.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'mindmap.iterate', descKey: 'mindmap.iterateDesc', imgSrc: '/img/example/知识导图-2.png' },
                  { labelKey: 'mindmap.complete', descKey: 'mindmap.completeDesc', imgSrc: '/img/example/知识导图-3.png' },
                  { labelKey: 'mindmap.editView', descKey: 'mindmap.editViewDesc', imgSrc: '/img/example/知识导图-4.png' },
                  { labelKey: 'mindmap.outline', descKey: 'mindmap.outlineDesc', imgSrc: '/img/example/知识导图-5.png' },
                  { labelKey: 'mindmap.recite', descKey: 'mindmap.reciteDesc', imgSrc: '/img/example/知识导图-6.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/知识导图-1.png" alt="Knowledge Mindmap" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

              {/* Module 7: 笔记 & 记忆管理 */}
              <FeatureSection
                id="feature-notes-memory"
                title={t('feature.notes_memory.title')}
                desc={t('feature.notes_memory.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'memory.generate', descKey: 'memory.generateDesc', imgSrc: '/img/example/记忆-1.png' },
                  { labelKey: 'memory.list', descKey: 'memory.listDesc', imgSrc: '/img/example/记忆-2.png' },
                  { labelKey: 'memory.detail', descKey: 'memory.detailDesc', imgSrc: '/img/example/记忆-3.png' },
                  { labelKey: 'memory.files', descKey: 'memory.filesDesc', imgSrc: '/img/example/记忆-4.png' },
                  { labelKey: 'memory.vector', descKey: 'memory.vectorDesc', imgSrc: '/img/example/向量化状态.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/笔记-1.png" alt="Notes & Memory Management" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

              {/* Module 8: 智能题库 */}
              <FeatureSection
                id="feature-qbank"
                layout="sticky"
                title={t('feature.qbank_full.title')}
                desc={t('feature.qbank_full.desc')}
                align="left"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'qbank.browse', descKey: 'qbank.browseDesc', imgSrc: '/img/example/题目集-2.png' },
                  { labelKey: 'qbank.practice', descKey: 'qbank.practiceDesc', imgSrc: '/img/example/题目集-3.png' },
                  { labelKey: 'qbank.analysis', descKey: 'qbank.analysisDesc', imgSrc: '/img/example/题目集-4.png' },
                  { labelKey: 'qbank.knowledge', descKey: 'qbank.knowledgeDesc', imgSrc: '/img/example/题目集-5.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/题目集-1.png" alt="Smart Q-Bank" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

              {/* Module 9: 作文批改 */}
              <FeatureSection
                id="feature-essay"
                title={t('feature.essay_full.title')}
                desc={t('feature.essay_full.desc')}
                align="right"
                motionScale={motionScale}
                subFeatures={[
                  { labelKey: 'essay.types', descKey: 'essay.typesDesc', imgSrc: '/img/example/作文批改-1.png' },
                  { labelKey: 'essay.detail', descKey: 'essay.detailDesc', imgSrc: '/img/example/作文-2.png' },
                ]}
              >
                <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl rounded-[6px] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] w-full mx-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[var(--apple-shadow-2xl)]">
                  <img src="/img/example/作文-1.png" alt="Essay Grading" className="w-full h-auto object-cover" />
                </div>
              </FeatureSection>

            </div>

            <FaqSection motionScale={motionScale} onOpenPolicy={handlePolicyOpen} />
          </main>
        </>
      )}

    <Footer onOpenPolicy={handlePolicyOpen} />
    <PolicyModal type={activePolicy} onClose={handlePolicyClose} />
  </div>
)
}

const TopNav = ({ onDownload = () => {} }) => {
  const { t } = useLocale()
  return (
    <nav className="sticky top-0 z-40 border-b border-[color:var(--apple-nav-border)] bg-[color:var(--apple-nav-bg)] backdrop-blur-[20px] backdrop-saturate-[180%]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-12">
        <a href="/" className="flex items-center gap-2.5 font-semibold text-[color:var(--apple-ink)] hover:opacity-80 transition-opacity">
          <img src={logo} alt="" className="h-5 w-auto sm:h-6 dark:invert" />
          <span className="text-[15px] tracking-tight">DeepStudent</span>
        </a>
        <div className="flex items-center gap-4 text-[12px] text-[color:var(--apple-muted)] font-normal">
          <a href="#features" className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors hidden sm:inline">
            {t('nav.features')}
          </a>
          <a href="#qa" className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors hidden sm:inline">
            {t('nav.qa')}
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
  const { t } = useLocale()
  const shouldAnimate = motionScale > 0
  const [activePreviewId, setActivePreviewId] = useState(heroPreviewItems[0].id)
  const activePreviewItem = heroPreviewItems.find(item => item.id === activePreviewId) || heroPreviewItems[0]
  const [isSubtextAnimating, setIsSubtextAnimating] = useState(false)
  const subtextTransitionTimerRef = useRef(null)
  const scrollY = useScrollY()
  const showScrollHint = scrollY < 100

  useEffect(() => {
    return () => {
      if (subtextTransitionTimerRef.current) {
        window.clearTimeout(subtextTransitionTimerRef.current)
      }
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

    setIsSubtextAnimating(true)
    setActivePreviewId(nextId)

    subtextTransitionTimerRef.current = window.setTimeout(() => {
      setIsSubtextAnimating(false)
      subtextTransitionTimerRef.current = null
    }, 650)
  }

  return (
    <header
      className="relative min-h-screen pt-20 pb-16 flex items-center overflow-hidden lg:overflow-visible"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,var(--apple-glow),transparent_70%)] blur-[100px] opacity-40" />
      </div>

      <div
        className={`relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${
          shouldAnimate ? 'animate-fade-in' : ''
        }`}
        style={shouldAnimate ? { animationDelay: '0.08s' } : undefined}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.9fr)] gap-8 sm:gap-10 lg:gap-8 xl:gap-12 items-center">
          <div className="flex flex-col items-start text-left order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.02em] mb-4 leading-[1.1] text-[color:var(--apple-ink)]">
              {t('hero.headline.top')}
              <br />
              <span className="whitespace-nowrap">{t('hero.headline.bottom')}</span>
            </h1>

            <button
              type="button"
              onClick={handleSubtextClick}
              disabled={isSubtextAnimating}
              aria-label={t(activePreviewItem.subtextKey)}
              className="text-left mb-8 cursor-pointer transition-opacity duration-150 hover:opacity-85 disabled:cursor-default disabled:opacity-100"
            >
              <span className="relative inline-flex h-[1.6em] items-center">
                <span
                  key={activePreviewId}
                  className="absolute inset-0 text-base sm:text-lg text-[color:var(--apple-muted)] whitespace-nowrap animate-fade-in-blur"
                >
                  {t(activePreviewItem.subtextKey)}
                </span>
              </span>
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadClick}
                className="px-8 py-3 bg-[color:var(--apple-ink)] text-[color:var(--apple-surface)] rounded-lg font-medium text-[15px] hover:opacity-90 active:scale-[0.98] transition-all duration-200"
              >
                {t('hero.cta.download')}
              </button>
              <button
                type="button"
                onClick={handleExploreClick}
                className="px-8 py-3 bg-transparent text-[color:var(--apple-ink)] border border-[color:var(--apple-line-strong)] rounded-lg font-medium text-[15px] hover:bg-[color:var(--apple-card)] transition-all duration-200"
              >
                {t('hero.cta.explore')}
              </button>
            </div>

            {showScrollHint && (
              <div
                className="hidden lg:flex flex-col items-start gap-1.5 cursor-pointer hover:opacity-80 transition-all duration-500 mt-8"
                onClick={handleExploreClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleExploreClick()}
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
    </header>
  )
}

const heroPreviewItems = [
  { id: 'chat', labelKey: 'hero.preview.chat', subtextKey: 'hero.preview.subtext.chat' },
  { id: 'skills', labelKey: 'hero.preview.skills', subtextKey: 'hero.preview.subtext.skills' },
  { id: 'knowledge', labelKey: 'hero.preview.knowledge', subtextKey: 'hero.preview.subtext.knowledge' },
  { id: 'providers', labelKey: 'hero.preview.providers', subtextKey: 'hero.preview.subtext.providers' },
]


const freeModels = [
  { id: 'qwen3-8b', label: 'Qwen3-8B' },
  { id: 'glm-4.1v', label: 'GLM-4.1V' },
  { id: 'bge-m3', label: 'BGE-M3' },
]

const FreeModelLogo = ({ id, className = 'h-4 w-4' }) => {
  switch (id) {
    case 'qwen3-8b':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M15.75 15.75L20 20" />
        </svg>
      )
    case 'glm-4.1v':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )
    case 'bge-m3':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="7" cy="12" r="2" />
          <circle cx="17" cy="7" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M8.7 11.2L15.3 8.2" />
          <path d="M8.7 12.8L15.3 15.8" />
        </svg>
      )
    default:
      return null
  }
}

const FreeModelsCallout = () => {
  const { t } = useLocale()

  const siliconflowLogo = '/siliconflow_Chinese%20and%20English%20LOGO.svg'
  const siliconflowLogoDark = '/siliconflow_Chinese%20and%20English%20LOGO_dark.svg'

  return (
    <div className="bg-[color:var(--apple-card)] backdrop-blur-2xl border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-xl)] rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {freeModels.map((model) => (
          <span
            key={model.id}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] text-[12px] font-medium text-[color:var(--apple-ink)]"
          >
            <FreeModelLogo id={model.id} />
            <span>{model.label}</span>
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 text-[11px] text-[color:var(--apple-muted)] text-center">
        <div>{t('freeModels.poweredBy', 'Powered by SiliconFlow')}</div>
        <div className="flex items-center justify-center">
          <img
            src={siliconflowLogo}
            alt="SiliconFlow"
            className="h-6 w-auto dark:hidden"
            loading="lazy"
            draggable="false"
          />
          <img
            src={siliconflowLogoDark}
            alt="SiliconFlow"
            className="h-6 w-auto hidden dark:block"
            loading="lazy"
            draggable="false"
          />
        </div>
      </div>
    </div>
  )
}

const HeroPreview = ({ style, className = 'max-w-[28rem] sm:max-w-[56rem] lg:max-w-[68rem]' }) => {
  const { t } = useLocale()

  return (
    <div
      className={`relative w-full ${className}`}
      style={style}
    >
      <div className="relative">
        {/* Desktop Image */}
        <div className="relative z-10 rounded-[6px] overflow-hidden shadow-2xl border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)]">
          <img
            src="/img/example/主页面.png"
            alt="DeepStudent Desktop"
            className="w-full h-auto"
            loading="lazy"
            draggable="false"
          />
        </div>

        <div className="absolute top-[54%] -translate-y-1/2 -right-8 z-20 w-[28%] rounded-[6px] overflow-hidden shadow-2xl border-[2px] border-gray-900 bg-black">
          <img
            src="/img/example/移动端主页面.png"
            alt="DeepStudent Mobile"
            className="w-full h-auto"
            loading="lazy"
            draggable="false"
          />
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
      className={`px-4 sm:px-6 max-w-4xl mx-auto pt-2 sm:pt-3 md:pt-4 pb-3 sm:pb-4 md:pb-6 ${
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

      <div className="mt-[1.5rem] sm:mt-[2rem] space-y-4">
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

// 占位图组件 - shimmer 动画，后续替换为真实截图
const ImagePlaceholder = ({ label }) => (
  <div className="w-full aspect-video rounded-2xl border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    <div className="z-10 flex flex-col items-center gap-2">
      <svg className="w-8 h-8 text-[color:var(--apple-muted)] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className="text-[12px] sm:text-[13px] text-[color:var(--apple-muted)] font-medium opacity-60">{label}</span>
    </div>
  </div>
)

// 动画变体定义
const revealAnimations = {
  'fade-up':    { hidden: 'opacity-0 translate-y-10',  visible: 'opacity-100 translate-y-0' },
  'fade-down':  { hidden: 'opacity-0 -translate-y-10', visible: 'opacity-100 translate-y-0' },
  'fade-left':  { hidden: 'opacity-0 translate-x-12',  visible: 'opacity-100 translate-x-0' },
  'fade-right': { hidden: 'opacity-0 -translate-x-12', visible: 'opacity-100 translate-x-0' },
  'scale-up':   { hidden: 'opacity-0 scale-90',        visible: 'opacity-100 scale-100' },
  'blur-in':    { hidden: 'opacity-0 blur-[6px] scale-[0.97]', visible: 'opacity-100 blur-0 scale-100' },
}

// 根据 index 自动选择动画变体，形成视觉节奏
const getAnimationVariant = (index) => {
  const variants = ['fade-up', 'fade-left', 'fade-right', 'scale-up', 'blur-in', 'fade-down']
  return variants[index % variants.length]
}

// 滚动浮现的独立图文项（用于移动端回退）
const ScrollRevealItem = ({ imgSrc, title, desc, align = 'left', index, animation }) => {
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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const variant = animation || getAnimationVariant(index)
  const anim = revealAnimations[variant] || revealAnimations['fade-up']
  const isLeft = align === 'left'

  return (
    <div
      ref={itemRef}
      className={`scroll-reveal-item flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 sm:gap-8 md:gap-12 transition-all duration-700 ease-out ${isVisible ? anim.visible : anim.hidden}`}
      style={{ transitionDelay: `${Math.min(index * 100, 400)}ms` }}
    >
      <div className="w-full md:w-[66%] md:flex-shrink-0">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            className="w-full rounded-[6px] shadow-[var(--apple-shadow-md)] border border-[color:var(--apple-line)]"
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder label={title} />
        )}
      </div>
      <div className="flex-1 min-w-0 text-center md:text-left">
        <h3 className="text-[1.125rem] sm:text-[1.25rem] font-semibold text-[color:var(--apple-ink)] mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-[0.875rem] sm:text-[0.9375rem] text-[color:var(--apple-muted)] leading-relaxed max-w-md mx-auto md:mx-0">
          {desc}
        </p>
      </div>
    </div>
  )
}

// ===== 交错图文展示组件 =====
const AlternatingFeatureGroup = ({ items, t }) => {
  return (
    <div className="space-y-[3rem] sm:space-y-[4rem] md:space-y-[6rem]">
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
const StickyImageFeatureGroup = ({ items, t }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const textRefs = useRef([])

  // 每个文字块独立挂载 IntersectionObserver，进入视口中心区域时激活对应图片
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observers = []
    textRefs.current.forEach((el, i) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(i)
          }
        },
        { rootMargin: '-35% 0px -35% 0px', threshold: 0.01 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [items.length])

  return (
    <div className="relative">
      {/* 移动端：普通流式布局，带多样化进入动画 */}
      <div className="md:hidden space-y-[2.5rem]">
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
            <div className="relative aspect-video rounded-[6px] flex items-center justify-center">
              {items.map((sf, i) => {
                const isActive = i === activeIndex
                return (
                  <div
                    key={sf.labelKey}
                    className={`absolute inset-0 transition-all duration-500 ease-out flex items-center justify-center ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
                    }`}
                    aria-hidden={!isActive}
                  >
                    {sf.imgSrc ? (
                      <img
                        src={sf.imgSrc}
                        alt={t(sf.labelKey)}
                        className="w-auto h-auto max-w-full max-h-full rounded-[6px] shadow-2xl"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
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
            <div className="flex justify-center gap-1.5 mt-4">
              {items.map((sf, i) => (
                <div
                  key={sf.labelKey}
                  className={`h-1 rounded-full transition-all duration-400 ${
                    i === activeIndex
                      ? 'w-6 bg-[color:var(--apple-ink)]'
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
            {items.map((sf, index) => {
              const isActive = index === activeIndex
              return (
                <div
                  key={sf.labelKey}
                  ref={(el) => { textRefs.current[index] = el }}
                  className="min-h-[50vh] flex items-center"
                >
                  <div
                    className={`py-6 transition-all duration-500 ease-out ${
                      isActive
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-30 translate-x-2'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold transition-colors duration-400 ${
                        isActive
                          ? 'bg-[color:var(--apple-ink)] text-[color:var(--apple-surface)]'
                          : 'bg-[color:var(--apple-line-strong)] text-[color:var(--apple-muted)]'
                      }`}>
                        {index + 1}
                      </span>
                      <div className={`h-px flex-1 transition-all duration-500 ${
                        isActive ? 'bg-[color:var(--apple-line-strong)]' : 'bg-transparent'
                      }`} />
                    </div>
                    <h3 className="text-[1.25rem] sm:text-[1.375rem] font-semibold text-[color:var(--apple-ink)] mb-2.5 tracking-tight leading-tight">
                      {t(sf.labelKey)}
                    </h3>
                    <p className="text-[0.9375rem] text-[color:var(--apple-muted)] leading-relaxed">
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

const FeatureSection = ({ id, title, desc, align, children, motionScale = 1, subFeatures = [], layout = 'alternating' }) => {
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
          <h2 className="text-[2rem] sm:text-[3rem] font-semibold text-[color:var(--apple-ink)] mb-[1.5rem] tracking-tight font-display leading-[1.1]">
            {title}
          </h2>
          <p className="text-[color:var(--apple-muted)] leading-[1.6] text-[1.1rem] sm:text-[1.35rem] font-medium tracking-tight mx-auto md:mx-0">{desc}</p>
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
    <footer className="border-t border-[color:var(--apple-line)] mt-4 sm:mt-6 bg-[color:var(--apple-card)] backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-8 sm:gap-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:gap-12 items-start">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 font-bold text-[color:var(--apple-ink)] text-lg tracking-tight">
                <img src={isDark ? logoFooterDark : logoFooter} alt="" className="h-9 w-auto" />
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
              href="https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f?xsec_token=ABFtyTy-x0Maimelyl74sy1an9VAHPgOOEjqScJeuijI8%3D&xsec_source=pc_search"
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
