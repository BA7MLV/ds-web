import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  ArrowLeft,
  ArrowDown,
  Brain,
  Download,
  FileText,
  LaptopMinimal,
  Layers,
  MonitorDot,
  Search,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react'
import logo from './assets/deepstudent-logo.svg'
import logoDark from './assets/deepstudent-logo-dark.svg'
import { ThemeToggle, useTheme } from './components/theme-toggle'
import { LocaleToggle, useLocale } from './components/locale-toggle'

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

const policyContent = {
  about: {
    title: '关于 DeepStudent',
    description: '一款面向学生与自学者的开源错题管理与复盘工具，帮助你建立长期可持续的学习系统。',
    sections: [
      {
        title: '我们在做什么',
        body: '将错题整理、知识图谱、复盘计划整合在一个工作流里，让复习更有方向感。',
        points: ['从错题出发形成可执行的复习路径。', '把学习记录沉淀成可复用的知识资产。'],
      },
      {
        title: '开源与共建',
        body: 'DeepStudent 完全开源，欢迎提交 Issue 与 PR，共同改进学习体验。',
        points: ['保持透明的开发节奏与版本发布记录。', '持续吸收社区的真实需求反馈。'],
      },
      {
        title: '联系我们',
        body: '合作或建议请发送邮件至 team@deepstudent.ai，我们会尽快回复。',
      },
    ],
    footer: '感谢你与我们一起打造更聪明、更高效的学习方式。',
  },
  privacy: {
    title: '隐私政策',
    description: '我们遵循最小化数据原则，确保每条学习记录都掌握在你手中。',
    sections: [
      {
        title: '收集范围',
        body: '仅在你使用 DeepStudent 时记录必要的错题内容、标签与复习进度，不会采集与服务无关的敏感个人信息。',
        points: ['账号信息仅用于云端同步与登录验证。', '你可随时导出或删除本地与云端数据。'],
      },
      {
        title: '使用方式',
        body: '所有数据仅用于生成个性化学习建议与统计分析，不会出售或提供给第三方广告平台。',
        points: ['统计分析仅使用匿名化、脱敏后的聚合数据。', '我们会定期发布透明度报告。'],
      },
      {
        title: '安全措施',
        body: '所有传输均使用 TLS 加密，云端存储采用分区隔离，敏感字段在数据库内加盐散列。',
        points: ['核心基础设施通过 ISO/IEC 27001 安全认证。', '如遇异常访问会立即告警并支持一键冻结账号。'],
      },
    ],
    footer: '更多隐私问题请发送邮件至 privacy@deepstudent.ai，我们会在 3 个工作日内回复。',
  },
  terms: {
    title: '使用条款',
    description: '使用 DeepStudent 即表示你同意以下约定，本服务为学习辅助工具，不构成绝对学习结果承诺。',
    sections: [
      {
        title: '服务内容',
        body: '我们提供错题整理、知识图谱、复习提醒等功能，能力会根据版本迭代持续更新。',
        points: ['测试功能可能存在不稳定，请按需体验。', '我们保留随时调整或暂停服务的权利。'],
      },
      {
        title: '用户责任',
        body: '你需确保上传内容拥有合法使用权，并对账号安全负责。若出现共享或泄露行为，请立即联系我们。',
        points: ['禁止利用 DeepStudent 传播违法或侵权内容。', '若发现异常活动，我们可能采取限制措施。'],
      },
      {
        title: '免责声明',
        body: '我们会尽力保证服务稳定，但因不可抗力或第三方原因导致的数据丢失、服务中断，我们不承担间接损失责任。',
        points: ['建议定期导出备份重要数据。', '付费计划如需退款，请在 7 天内提交申请。'],
      },
    ],
    footer: '使用本服务即视为同意上述条款。如有疑问请联系 support@deepstudent.ai。',
  },
}

const App = () => {
  const [activePolicy, setActivePolicy] = useState(null)
  const [isDownloadPage, setIsDownloadPage] = useState(() => getIsDownloadFromLocation())
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

          <main
            id="features"
            className={`relative z-10 scroll-mt-24 pb-[6.854rem] sm:pb-[11.09rem] ${
              motionScale > 0 ? 'animate-fade-in' : ''
            }`}
            style={motionScale > 0 ? { animationDelay: '0.18s' } : undefined}
          >
            <div className="space-y-[6.854rem] sm:space-y-[11.09rem] lg:space-y-[17.944rem] pt-[4.236rem] sm:pt-[6.854rem]">
              <FeatureSection
                icon={<Brain className="w-6 h-6" aria-hidden="true" />}
                title="错题复盘"
                desc="把错因写清楚、归好类，复习时一眼就知道从哪里开始。"
                align="left"
                motionScale={motionScale}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-xl p-[1.618rem] sm:p-[2.618rem] rounded-[1.618rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-md)] max-w-[17.944rem] sm:max-w-[29.034rem] mx-auto transform transition-transform hover:scale-[1.02] active:scale-[1.01] duration-500">
              <div className={cardHeaderClass}>
                <div className="w-8 h-8 rounded-full bg-[color:var(--apple-card-strong)] ring-1 ring-[color:var(--apple-line)] flex items-center justify-center text-[color:var(--apple-ink)]">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[color:var(--apple-ink)]">深度分析中</div>
                  <div className="text-xs text-[color:var(--apple-muted)]">刚刚</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-2 w-full bg-[color:var(--apple-card-strong)] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-[color:var(--apple-blue)] w-3/4 rounded-full ${
                      motionScale > 0 ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
                <div className="flex justify-between text-xs text-[color:var(--apple-muted)] font-medium mt-1">
                  <span>知识点掌握</span>
                  <span className="text-[color:var(--apple-ink)]">72%</span>
                </div>
                <div className="mt-[2.618rem] p-[1.618rem] bg-[color:var(--apple-card-strong)] rounded-[1rem] border border-[color:var(--apple-line)] text-sm text-[color:var(--apple-muted)] leading-relaxed">
                  <span className="font-semibold text-[color:var(--apple-ink)] block mb-1">建议：</span>
                  重新复习{' '}
                  <span className="text-[color:var(--apple-ink)] underline decoration-[color:var(--apple-line)] underline-offset-2">
                    导数定义
                  </span>{' '}
                  相关章节，并加强基础计算训练。
                </div>
              </div>
            </div>
          </FeatureSection>

          <FeatureSection
            icon={<Layers className="w-6 h-6" aria-hidden="true" />}
                title="有序，不只是整理"
                desc="集中管理所有学科错题，按知识点、难度、时间分类，像系统文件管理器一样井井有条。"
                align="right"
                motionScale={motionScale}
              >
            <div className="relative max-w-[17.944rem] sm:max-w-[29.034rem] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color:var(--apple-surface)] z-20 pointer-events-none" />
              <div className="bg-[color:var(--apple-card)] backdrop-blur-xl rounded-[1.618rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-md)] overflow-hidden">
                <div className="px-[1.618rem] py-[1rem] border-b border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] backdrop-blur flex items-center gap-[0.618rem]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="text-xs font-medium text-[color:var(--apple-muted)] ml-2">我的错题本</div>
                </div>
                <div className="p-[1rem]">
                  {[
                    { title: '2023 高数期末', tag: '数学', date: '今天' },
                    { title: '英语阅读理解专项', tag: '英语', date: '昨天' },
                    { title: '物理力学错题集', tag: '物理', date: '2 天前' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between p-[1rem] hover:bg-[color:var(--apple-card-hover)] active:bg-[color:var(--apple-card-hover)] rounded-[1rem] transition-colors group cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-[color:var(--apple-card-strong)] rounded border border-[color:var(--apple-line)] flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[color:var(--apple-muted)]" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[color:var(--apple-ink)] group-hover:text-[color:var(--apple-blue)] transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-[color:var(--apple-muted)] uppercase tracking-wider mt-0.5">
                            {item.tag}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[color:var(--apple-muted)]">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FeatureSection>

          <FeatureSection
            icon={<Target className="w-6 h-6" aria-hidden="true" />}
                title="多题回顾"
                desc="把相关题目放在一起看，理解共性错误，形成自己的复习重点。"
                align="left"
                motionScale={motionScale}
              >
            <div className="bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0e] dark:from-[#1c1c20] dark:via-[#151518] dark:to-[#0f0f12] text-white p-[1.618rem] sm:p-[2.618rem] rounded-[1.618rem] shadow-[var(--apple-shadow-lg)] border border-white/10 max-w-[17.944rem] sm:max-w-[29.034rem] mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 p-[1.618rem] opacity-30">
                <Target className="w-24 h-24" aria-hidden="true" />
              </div>
              <div className="relative z-10">
                <div className="text-sm text-white/60 mb-1">错误类型</div>
                <div className="text-2xl font-bold mb-[2.618rem]">计算错误</div>
                <div className="space-y-[1.618rem]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">频次</span>
                    <span className="font-mono">高 (8/10)</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-white/90 h-full w-[80%]" />
                  </div>
                  <div className="p-[1rem] bg-white/10 rounded-[1rem] text-xs text-white/70 border border-white/10 mt-[1.618rem]">
                    建议在进行复杂运算时，增加验算步骤，特别是符号变换环节。
                  </div>
                </div>
              </div>
            </div>
          </FeatureSection>

          <FeatureSection
            icon={<Zap className="w-6 h-6" aria-hidden="true" />}
                title="间隔复习"
                desc="对接间隔复习法，轻松生成卡片，循序巩固。"
                align="right"
                motionScale={motionScale}
              >
            <div className="flex justify-center">
              <Flashcard motionScale={motionScale} />
            </div>
          </FeatureSection>

          <FeatureSection
            icon={<Search className="w-6 h-6" aria-hidden="true" />}
                title="知识补充"
                desc="内置参考库。遇到卡住的题，可以直接翻到相关章节和思路。"
                align="left"
                motionScale={motionScale}
              >
            <div className="bg-[color:var(--apple-card)] backdrop-blur-xl p-[1.618rem] rounded-[1.618rem] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-md)] max-w-[17.944rem] sm:max-w-[29.034rem] mx-auto">
              <div className="space-y-[1.618rem]">
                <div className="flex gap-[1rem] flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[color:var(--apple-btn-primary-bg)] flex-shrink-0" />
                  <div className="bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] px-[1.618rem] py-[0.618rem] rounded-[1.618rem] rounded-tr-[0.618rem] text-sm">
                    这道题选 C 的原因是什么？
                  </div>
                </div>
                <div className="flex gap-[1rem]">
                  <div className="w-8 h-8 rounded-full bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-[color:var(--apple-ink)]" aria-hidden="true" />
                  </div>
                  <div className="bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] text-[color:var(--apple-ink)] px-[1.618rem] py-[0.618rem] rounded-[1.618rem] rounded-tl-[0.618rem] text-sm shadow-sm">
                    <p className="mb-2 font-semibold text-xs text-[color:var(--apple-muted)] uppercase tracking-wider">
                      参考：第 4 章
                    </p>
                    根据洛必达法则，当 x 趋近于 0 时，分子分母同时求导...
                  </div>
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
          <img src={isDark ? logoDark : logo} alt="DeepStudent logo" className="w-5 h-5" />
          <span className="text-[15px] tracking-tight">DeepStudent</span>
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
  const subtitleOffset = heroEase * (120 + heroJuice * 10) * motionAmount
  const textOffset = heroEase * (150 + heroJuice * 12) * motionAmount
  const ctaOffset = heroEase * (180 + heroJuice * 14) * motionAmount

  const previewOffset = heroEase * 80 * motionAmount
  const previewStyle = {
    transform: isStatic ? 'none' : `translate3d(0, ${previewOffset}px, 0)`,
    opacity: heroFade,
    transformStyle: 'flat',
    willChange: isStatic ? 'auto' : 'transform, opacity',
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
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-[100%] bg-[radial-gradient(ellipse_at_center,var(--apple-glow),transparent_60%)] blur-3xl opacity-80 dark:opacity-100" />
        {/* Secondary accent - purple tint */}
        <div className="absolute top-[10%] -right-[20%] h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_50%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(191,90,242,0.15),transparent_50%)]" />
        {/* Tertiary accent - left side */}
        <div className="absolute top-[20%] -left-[15%] h-[50vh] w-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,113,227,0.06),transparent_50%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(10,132,255,0.12),transparent_50%)]" />
        {/* Subtle ambient light overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color:var(--apple-surface)] opacity-60" />
      </div>
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center gap-[3rem] sm:gap-[3.618rem] ${
          shouldAnimate ? 'animate-fade-in' : ''
        }`}
        style={shouldAnimate ? { animationDelay: '0.08s' } : undefined}
      >
        <div className="flex flex-col items-center text-center max-w-3xl">
          <h1
            className="text-[1.75rem] sm:text-[2.5rem] md:text-[3.2rem] font-semibold tracking-[-0.02em] mb-[1rem] sm:mb-[1.25rem] leading-[1.15] font-display text-[color:var(--apple-ink)]"
            style={layerStyle2d(subtitleOffset)}
          >
            {t('hero.subtitle')}
          </h1>

          <p
            className="text-[1rem] sm:text-[1.15rem] text-[color:var(--apple-muted)] max-w-xl mb-[2rem] sm:mb-[2.5rem] leading-[1.65] font-display"
            style={layerStyle2d(textOffset)}
          >
            {t('hero.tagline')}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 w-full max-w-[17.944rem] sm:max-w-[26rem] justify-center"
            style={layerStyle2d(ctaOffset)}
          >
            <button
              type="button"
              onClick={onDownload}
              className="focus-ring flex-1 py-[0.9rem] px-[1.5rem] sm:py-[1rem] sm:px-[2rem] md:py-[1.1rem] md:px-[2.2rem] bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] rounded-full font-medium text-sm md:text-[15px] hover:bg-[color:var(--apple-btn-primary-bg-hover)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-blue"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              {t('hero.cta.download')}
            </button>
            <button
              type="button"
              onClick={handleExplore}
              className="focus-ring flex-1 py-[0.9rem] px-[1.5rem] sm:py-[1rem] sm:px-[2rem] md:py-[1.1rem] md:px-[2.2rem] bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-btn-secondary-text)] rounded-full font-medium text-sm md:text-[15px] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
              {t('hero.cta.explore')}
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <HeroPreview style={previewStyle} />
        </div>
      </div>
    </header>
  )
}

const heroPreviewItems = [
  {
    id: 'chat',
    labelZh: 'AI 对话',
    labelEn: 'AI Chat',
    icon: Sparkles,
    src: '/img/hero-preview-overview.jpg',
  },
  {
    id: 'skills',
    labelZh: '技能',
    labelEn: 'Skills',
    icon: Zap,
    src: '/img/hero-preview-skills.jpg',
  },
  {
    id: 'knowledge',
    labelZh: '知识管理',
    labelEn: 'Knowledge',
    icon: FileText,
    src: '/img/hero-preview-mistakes.jpg',
  },
  {
    id: 'providers',
    labelZh: '多服务商',
    labelEn: 'Providers',
    icon: MonitorDot,
    src: '/img/hero-preview-review.jpg',
  },
]

const HeroPreview = ({ style }) => {
  const { isZh } = useLocale()
  const [activeId, setActiveId] = useState(heroPreviewItems[0].id)
  const activeItem = heroPreviewItems.find((item) => item.id === activeId) || heroPreviewItems[0]
  const imageAlt = isZh
    ? `DeepStudent ${activeItem.labelZh} 界面预览（占位图）`
    : `DeepStudent ${activeItem.labelEn} preview (placeholder)`
  const segmentedControlRef = useRef(null)
  const segmentedSliderRef = useRef(null)

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
    const intervalId = window.setInterval(() => {
      setActiveId((prev) => {
        const currentIndex = heroPreviewItems.findIndex((item) => item.id === prev)
        const safeIndex = currentIndex >= 0 ? currentIndex : 0
        const nextIndex = (safeIndex + 1) % heroPreviewItems.length
        return heroPreviewItems[nextIndex].id
      })
    }, 20000)
    return () => window.clearInterval(intervalId)
  }, [])

  useLayoutEffect(() => {
    updateSegmentedSlider()
  }, [updateSegmentedSlider, isZh])

  useEffect(() => {
    window.addEventListener('resize', updateSegmentedSlider)
    return () => window.removeEventListener('resize', updateSegmentedSlider)
  }, [updateSegmentedSlider])

  return (
    <div
      className="relative w-full max-w-[24rem] sm:max-w-[52rem] lg:max-w-[60rem]"
      style={style}
    >
      <div className="relative">
        <div className="relative rounded-[2.2rem] shadow-[var(--apple-shadow-xl)]">
          <div className="relative overflow-hidden rounded-[2.2rem]">
            <div className="relative aspect-[16/10] bg-[color:var(--apple-card-strong)]">
              <img
                src={activeItem.src}
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                draggable="false"
              />
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 flex justify-center -translate-y-1/2 px-3 sm:px-4 z-10">
            <div
              ref={segmentedControlRef}
              className="segmented-control"
              role="group"
              aria-label={isZh ? '界面预览切换' : 'Preview selector'}
            >
              <div
                ref={segmentedSliderRef}
                className="segmented-control__slider"
                aria-hidden="true"
              />
              {heroPreviewItems.map((item) => {
                const isActive = item.id === activeId
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    data-segment-id={item.id}
                    className={`segmented-control__btn focus-ring${isActive ? ' is-active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {isZh ? item.labelZh : item.labelEn}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DownloadPage = ({ onBack = () => {} }) => {
  const { t, isZh } = useLocale()
  const platformDownloads = [
    {
      id: 'mac',
      platform: 'macOS',
      channel: isZh ? 'DMG 安装' : 'DMG Install',
      version: 'v1.0.2 · Build 88',
      size: '312 MB',
      requirements: isZh ? 'macOS 13+，Apple Silicon 优化' : 'macOS 13+, Apple Silicon optimized',
      description: isZh ? '菜单栏快捷录入，支持 Spotlight 搜索。' : 'Menu bar quick entry, Spotlight search support.',
      ctaLabel: t('download.downloadDmg'),
      ctaHref: 'https://downloads.deepstudent.ai/macos/deepstudent-v1.0.2.dmg',
      icon: MonitorDot,
      iconBg: 'bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)]',
    },
    {
      id: 'windows',
      platform: 'Windows',
      channel: isZh ? '预览版' : 'Preview',
      version: 'v0.9.8 Preview',
      size: '298 MB',
      requirements: 'Windows 11 / 10 22H2+',
      description: isZh ? '预览版含 OneNote 导入与系统托盘控件。' : 'Preview includes OneNote import and system tray controls.',
      ctaLabel: t('download.downloadExe'),
      ctaHref: 'https://downloads.deepstudent.ai/windows/deepstudent-setup.exe',
      icon: LaptopMinimal,
      iconBg: 'bg-[color:var(--apple-card-strong)] text-[color:var(--apple-ink)] border border-[color:var(--apple-line)]',
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
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t('download.backHome')}
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
          {platformDownloads.map((platform) => {
            const Icon = platform.icon
            return (
              <article
                key={platform.id}
                className="rounded-[1.5rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] p-[1.5rem] sm:p-[1.75rem] shadow-[var(--apple-shadow-sm)]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-[0.9rem] flex items-center justify-center ${platform.iconBg}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[color:var(--apple-ink)]">{platform.platform}</p>
                    <p className="text-xs text-[color:var(--apple-muted)]">{platform.channel}</p>
                  </div>
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
                    <Download className="w-4 h-4" aria-hidden="true" />
                    {platform.ctaLabel}
                  </a>
                </div>
              </article>
            )
          })}
        </div>

        <p className="mt-6 text-xs text-[color:var(--apple-muted)]">
          Windows 仍为预览版，如需帮助请联系 support@deepstudent.ai。
        </p>
      </section>
    </div>
  )
}

const FaqSection = ({ motionScale = 1, onOpenPolicy = () => {} }) => {
  const shouldAnimate = motionScale > 0
  const faqItems = [
    {
      id: 'open-source',
      question: 'DeepStudent 是开源的吗？',
      answer: '是的，DeepStudent 完全开源。你可以在 GitHub 查看源码并参与共建。',
      linkHref: 'https://github.com/deepstudents/ai-mistake-manager',
      linkLabel: '前往 GitHub',
    },
    {
      id: 'privacy',
      question: '我的数据会被如何使用？',
      answer: '我们遵循最小化数据原则，数据仅用于生成个性化学习建议与统计分析。',
      actionLabel: '查看隐私政策',
      onAction: () => onOpenPolicy('privacy'),
    },
    {
      id: 'macos-quarantine',
      question: 'macOS 安装后提示“已损坏，无法打开”怎么办？',
      answer:
        '可以在终端执行以下命令（把 <应用路径> 替换为你的应用路径；也可以把应用图标拖进终端自动填充路径）：',
      code: 'sudo xattr -r -d com.apple.quarantine <应用路径>',
      linkHref: '/docs/guide/A-Q',
      linkLabel: '查看完整步骤',
    },
    {
      id: 'windows-preview',
      question: 'Windows 版本是正式版吗？',
      answer: '目前 Windows 仍为预览版，我们会持续迭代。遇到问题可联系 support@deepstudent.ai。',
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
          常见问题
        </h2>
        <p className="text-sm sm:text-base text-[color:var(--apple-muted)] leading-relaxed">
          关于 DeepStudent 的常见疑问解答
        </p>
      </div>

      <div className="mt-[2.618rem] space-y-3">
        {faqItems.map((item) => (
          <details
            key={item.id}
            className="group rounded-[1.618rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-sm)] overflow-hidden"
          >
            <summary className="focus-ring flex items-center justify-between gap-4 p-[1.25rem] sm:p-[1.5rem] cursor-pointer select-none [&::-webkit-details-marker]:hidden">
              <span className="text-sm sm:text-base font-medium text-[color:var(--apple-ink)]">
                {item.question}
              </span>
              <ArrowDown
                className="w-4 h-4 text-[color:var(--apple-muted)] transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>

            <div className="px-[1.25rem] sm:px-[1.5rem] pb-[1.25rem] sm:pb-[1.5rem] text-sm text-[color:var(--apple-muted)] leading-relaxed">
              <p>{item.answer}</p>

              {item.code ? (
                <pre className="mt-3 rounded-[0.9rem] bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] p-3 overflow-x-auto text-xs">
                  <code className="font-mono">{item.code}</code>
                </pre>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {item.actionLabel ? (
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-4 py-2 text-xs font-medium text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-95 transition-all"
                  >
                    {item.actionLabel}
                  </button>
                ) : null}
                {item.linkHref ? (
                  <a
                    href={item.linkHref}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-4 py-2 text-xs font-medium text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-95 transition-all"
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

const FeatureSection = ({ icon, title, desc, align, children, motionScale = 1 }) => {
  const { ref, progress, isActive } = useParallaxProgress()
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
    <section ref={ref} className="px-4 sm:px-6 max-w-4xl mx-auto py-[2.618rem] sm:py-[4.236rem] md:py-[6.854rem]">
      <div className={`flex flex-col ${contentDirection} items-center gap-[2.618rem] sm:gap-[4.236rem] md:gap-[6.854rem]`}>
        <div
          className="flex-1 text-center md:text-left"
          style={{
            transform: isStatic ? 'none' : `translate3d(0, ${textShift}px, 0)`,
            opacity,
            transformStyle: 'flat',
            willChange: shouldAnimate ? 'transform, opacity' : 'auto',
          }}
        >
          <div className="inline-flex items-center justify-center w-[2.618rem] h-[2.618rem] rounded-[1.618rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-sm)] text-[color:var(--apple-ink)] mb-[1.618rem]">
            {icon}
          </div>
          <h2 className="text-[1.618rem] sm:text-[2.618rem] font-semibold text-[color:var(--apple-ink)] mb-[1.618rem] tracking-[-0.02em] font-display">
            {title}
          </h2>
          <p className="text-[color:var(--apple-muted)] leading-[1.618] text-[1rem] sm:text-[1.618rem] font-normal">{desc}</p>
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

  return (
    <div
      className={`bg-[color:var(--apple-card)] backdrop-blur-xl border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-lg)] rounded-[1.618rem] p-[1.618rem] sm:p-[2.618rem] w-[17.944rem] aspect-[1/1.618] flex flex-col items-center text-center justify-center relative rotate-1 ${
        shouldAnimate ? 'transition-transform duration-500' : ''
      } hover:rotate-0 active:rotate-0`}
    >
      <div className="absolute top-[1.618rem] left-[1.618rem] w-[0.618rem] h-[0.618rem] bg-[color:var(--apple-ink)] rounded-full" />
      <div
        className={`absolute inset-0 bg-[color:var(--apple-card-strong)] backdrop-blur-sm flex items-center justify-center rounded-[1.618rem] ${
          shouldAnimate ? 'transition-opacity duration-300' : ''
        } ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isFlipped}
      >
        <div className="text-2xl font-bold text-[color:var(--apple-ink)]">1 / x</div>
      </div>
      <div
        className={`relative z-10 flex flex-col items-center ${
          shouldAnimate ? 'transition-opacity duration-300' : ''
        } ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden={isFlipped}
      >
        <div className="text-xs font-bold text-[color:var(--apple-muted)] tracking-[0.2em] uppercase mb-[0.618rem]">
          题目
        </div>
        <div className="text-[1.618rem] font-sans text-[color:var(--apple-ink)]">
          ln(x) 的导数是什么？
        </div>
      </div>
      <div className="w-full h-px bg-[color:var(--apple-line)] my-[2.618rem]" />
      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className="focus-ring relative z-20 text-xs text-[color:var(--apple-muted)] font-medium px-3 py-1.5 rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] hover:text-[color:var(--apple-ink)] hover:border-[color:var(--apple-line-strong)] active:text-[color:var(--apple-ink)] transition-colors"
        aria-pressed={isFlipped}
      >
        {isFlipped ? '返回题目' : '点击查看答案'}
      </button>
    </div>
  )
}

const PolicyModal = ({ type, onClose }) => {
  const data = type ? policyContent[type] : null
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
            aria-label="关闭弹窗"
            ref={closeButtonRef}
          >
            <X className="w-4 h-4" aria-hidden="true" />
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
          我已了解
        </button>
      </div>
    </div>
  )
}

const Footer = ({ onOpenPolicy = () => {} }) => {
  const { isDark } = useTheme()
  const { t } = useLocale()
  return (
    <footer className="border-t border-[color:var(--apple-line)] py-12 px-4 sm:px-6 mt-24 bg-[color:var(--apple-card)] backdrop-blur-xl">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 gap-8 items-center sm:grid-cols-2 sm:items-start md:grid-cols-[auto_1fr_auto] md:gap-x-10">
        <div className="flex flex-col items-center sm:items-start gap-3">
          <div className="flex items-center gap-2 font-semibold text-[color:var(--apple-ink)]">
            <img src={isDark ? logoDark : logo} alt="DeepStudent logo" className="w-5 h-5" />
            DeepStudent
          </div>
          <a
            href="https://www.xiaohongshu.com/user/profile/657fb438000000001902dbcf"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center justify-center w-9 h-9 rounded-full bg-zinc-500 text-white hover:bg-zinc-600 transition-colors"
            aria-label="小红书"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">
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
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[color:var(--apple-muted)] font-medium sm:col-span-2 sm:row-start-2 sm:gap-x-8 md:col-span-1 md:col-start-2 md:row-start-1">
          <button
            type="button"
            onClick={() => onOpenPolicy('privacy')}
            className="focus-ring hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
          >
            {t('footer.privacy')}
          </button>
          <button
            type="button"
            onClick={() => onOpenPolicy('about')}
            className="focus-ring hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
          >
            {t('footer.about')}
          </button>
          <button
            type="button"
            onClick={() => onOpenPolicy('terms')}
            className="focus-ring hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
          >
            {t('footer.terms')}
          </button>
          <a
            href="https://github.com/deepstudents/ai-mistake-manager"
            className="focus-ring hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>

        <div className="text-xs text-[color:var(--apple-muted)] flex flex-col items-center sm:col-start-2 sm:row-start-1 sm:items-end sm:justify-self-end md:col-start-3 md:row-start-1 gap-2">
          <LocaleToggle />
          <span>© 2025 DeepStudent Team.</span>
          <span className="font-mono text-[0.65rem] tracking-[0.08em]">Build {buildHash}</span>
        </div>
      </div>
    </footer>
  )
}

export default App
