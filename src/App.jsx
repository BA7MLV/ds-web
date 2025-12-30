import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  ArrowLeft,
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

const cardHeaderClass = 'flex items-center gap-3 mb-[1.618rem]'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const easeOutBack = (t, overshoot = 1.12) => {
  const u = t - 1
  return 1 + (overshoot + 1) * u * u * u + overshoot * u * u
}

const useSpringValue = (
  target,
  { stiffness = 170, damping = 20, precision = 0.0004, maxDelta = 0.05 } = {},
  enabled = true
) => {
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)
  const targetRef = useRef(target)
  const velocityRef = useRef(0)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(0)
  const enabledRef = useRef(enabled)
  const configRef = useRef({ stiffness, damping, precision, maxDelta })

  useEffect(() => {
    targetRef.current = target
  }, [target])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    configRef.current = { stiffness, damping, precision, maxDelta }
  }, [stiffness, damping, precision, maxDelta])

  const stop = useCallback((snap = false) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTimeRef.current = 0
    velocityRef.current = 0
    if (snap) {
      const nextValue = targetRef.current
      valueRef.current = nextValue
      setValue(nextValue)
    }
  }, [])

  const step = useCallback((time) => {
    if (!enabledRef.current) {
      rafRef.current = null
      return
    }
    if (!lastTimeRef.current) lastTimeRef.current = time
    const { stiffness: k, damping: c, precision: p, maxDelta: maxStep } = configRef.current
    const dt = Math.min(maxStep, (time - lastTimeRef.current) / 1000)
    lastTimeRef.current = time

    const targetValue = targetRef.current
    let current = valueRef.current
    let velocity = velocityRef.current

    const displacement = targetValue - current
    const spring = displacement * k
    const damper = velocity * c

    velocity += (spring - damper) * dt
    current += velocity * dt

    if (Math.abs(velocity) < p && Math.abs(displacement) < p) {
      current = targetValue
      velocity = 0
      valueRef.current = current
      velocityRef.current = velocity
      setValue(current)
      rafRef.current = null
      lastTimeRef.current = 0
      return
    }

    valueRef.current = current
    velocityRef.current = velocity
    setValue(current)
    rafRef.current = requestAnimationFrame(step)
  }, [])

  const start = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(step)
  }, [step])

  useEffect(() => {
    if (!enabled) {
      stop(true)
      return
    }
    start()
    return () => stop(false)
  }, [enabled, start, stop])

  useEffect(() => {
    if (enabled && !rafRef.current) start()
  }, [target, enabled, start])

  return value
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
  const [isDownloadPage, setIsDownloadPage] = useState(false)
  const { motionScale } = useResponsiveMotion()
  const homeScrollRef = useRef(0)
  const downloadScrollRef = useRef(0)

  const handlePolicyOpen = (type) => setActivePolicy(type)
  const handlePolicyClose = () => setActivePolicy(null)

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
  }
  const handleDownloadClose = () => {
    downloadScrollRef.current = window.scrollY || 0
    setIsDownloadPage(false)
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
            <div className="bg-white/85 backdrop-blur-sm sm:backdrop-blur-xl p-[1.618rem] sm:p-[2.618rem] rounded-[1.618rem] border border-white/60 sm:border-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:shadow-[0_25px_70px_rgba(15,23,42,0.12)] max-w-[17.944rem] sm:max-w-[29.034rem] mx-auto transform transition-transform hover:scale-[1.02] active:scale-[1.01] duration-500">
              <div className={cardHeaderClass}>
                <div className="w-8 h-8 rounded-full bg-black/5 ring-1 ring-white/60 flex items-center justify-center text-[color:var(--apple-ink)]">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[color:var(--apple-ink)]">深度分析中</div>
                  <div className="text-xs text-[color:var(--apple-muted)]">刚刚</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
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
                <div className="mt-[2.618rem] p-[1.618rem] bg-white/70 rounded-[1rem] border border-white/70 text-sm text-[color:var(--apple-muted)] leading-relaxed">
                  <span className="font-semibold text-[color:var(--apple-ink)] block mb-1">建议：</span>
                  重新复习{' '}
                  <span className="text-[color:var(--apple-ink)] underline decoration-black/20 underline-offset-2">
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
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/80 z-20 pointer-events-none" />
              <div className="bg-white/85 backdrop-blur-sm sm:backdrop-blur-xl rounded-[1.618rem] border border-white/60 sm:border-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:shadow-[0_25px_70px_rgba(15,23,42,0.12)] overflow-hidden">
                <div className="px-[1.618rem] py-[1rem] border-b border-white/60 bg-white/80 backdrop-blur-sm sm:backdrop-blur flex items-center gap-[0.618rem]">
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
                      className="flex items-center justify-between p-[1rem] hover:bg-black/5 active:bg-black/5 rounded-[1rem] transition-colors group cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-black/5 rounded border border-white/60 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[color:var(--apple-muted)]" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[color:var(--apple-ink)] group-hover:text-black transition-colors">
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
            <div className="bg-gradient-to-br from-[#15171c] via-[#0f1115] to-[#0b0d10] text-white p-[1.618rem] sm:p-[2.618rem] rounded-[1.618rem] shadow-[0_20px_50px_rgba(15,23,42,0.4)] sm:shadow-[0_35px_80px_rgba(15,23,42,0.45)] border border-white/10 max-w-[17.944rem] sm:max-w-[29.034rem] mx-auto relative overflow-hidden">
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
            <div className="bg-white/85 backdrop-blur-sm sm:backdrop-blur-xl p-[1.618rem] rounded-[1.618rem] border border-white/60 sm:border-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:shadow-[0_25px_70px_rgba(15,23,42,0.12)] max-w-[17.944rem] sm:max-w-[29.034rem] mx-auto">
              <div className="space-y-[1.618rem]">
                <div className="flex gap-[1rem] flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-black flex-shrink-0" />
                  <div className="bg-black text-white px-[1.618rem] py-[0.618rem] rounded-[1.618rem] rounded-tr-[0.618rem] text-sm">
                    这道题选 C 的原因是什么？
                  </div>
                </div>
                <div className="flex gap-[1rem]">
                  <div className="w-8 h-8 rounded-full bg-white/90 border border-white/70 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-[color:var(--apple-ink)]" aria-hidden="true" />
                  </div>
                  <div className="bg-white/90 border border-white/70 text-[color:var(--apple-ink)] px-[1.618rem] py-[0.618rem] rounded-[1.618rem] rounded-tl-[0.618rem] text-sm shadow-sm">
                    <p className="mb-2 font-semibold text-xs text-[color:var(--apple-muted)] uppercase tracking-wider">
                      参考：第 4 章
                    </p>
                    根据洛必达法则，当 x 趋近于 0 时，分子分母同时求导...
                  </div>
                </div>
              </div>
            </div>
          </FeatureSection>
        </div>
      </main>
      </>
    )}

    <Footer onOpenPolicy={handlePolicyOpen} />
    <PolicyModal type={activePolicy} onClose={handlePolicyClose} />
  </div>
)
}

const TopNav = ({ onDownload = () => {} }) => (
  <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-sm sm:backdrop-blur-xl">
    <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
      <div className="flex items-center gap-2 font-semibold text-[color:var(--apple-ink)]">
        <img src={logo} alt="DeepStudent logo" className="w-5 h-5" />
        <span className="text-sm tracking-tight">DeepStudent</span>
      </div>
      <div className="flex items-center gap-5 text-xs text-[color:var(--apple-muted)] font-medium">
        <a href="#features" className="focus-ring hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors">
          功能
        </a>
        <button
          type="button"
          onClick={onDownload}
          className="focus-ring rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/85 active:bg-black/90 transition-colors"
        >
          下载
        </button>
      </div>
    </div>
  </nav>
)

const HeroSection = ({ onDownload = () => {}, motionScale = 1 }) => {
  const scrollY = useScrollY()
  const motionAmount = Math.max(0, motionScale)
  const isStatic = motionAmount === 0
  const shouldAnimate = motionScale > 0
  const heroProgress = clamp(scrollY / 360, 0, 1)
  const heroSpring = useSpringValue(heroProgress, { stiffness: 150, damping: 18 }, shouldAnimate)
  const heroEase = easeOutCubic(heroSpring)
  const heroBack = easeOutBack(heroSpring, 1.06)
  const heroMotion = heroEase + (heroBack - heroEase) * 0.5
  const heroJuice = Math.sin(clamp(heroSpring, 0, 1) * Math.PI)
  const heroRebound = (heroSpring - heroProgress) * 160 * motionAmount
  const heroFade = 1 - heroEase * 0.55 * motionAmount
  const layerStyle2d = (offsetY) => ({
    transform: isStatic ? 'none' : `translate3d(0, ${offsetY}px, 0)`,
    opacity: heroFade,
    transformStyle: 'flat',
    willChange: isStatic ? 'auto' : 'transform, opacity',
  })
  const titleOffset = heroMotion * (170 + heroJuice * 20) * motionAmount + heroRebound * 0.12
  const subtitleOffset = heroMotion * (210 + heroJuice * 24) * motionAmount + heroRebound * 0.2
  const textOffset = heroMotion * (240 + heroJuice * 28) * motionAmount + heroRebound * 0.28
  const ctaOffset = heroMotion * (270 + heroJuice * 32) * motionAmount + heroRebound * 0.36

  return (
    <header
      className="relative min-h-screen min-h-[100svh] px-4 sm:px-6 pt-[4.236rem] pb-[6.854rem] sm:pt-[6.854rem] sm:pb-[11.09rem] flex flex-col items-center text-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,113,227,0.35),transparent_65%)] blur-3xl opacity-70" />
        <div className="absolute top-10 right-[-12%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(255,255,255,0.9),transparent_70%)]" />
      </div>
      <div
        className={`relative z-10 flex flex-col items-center w-full ${shouldAnimate ? 'animate-fade-in' : ''}`}
        style={shouldAnimate ? { animationDelay: '0.08s' } : undefined}
      >
        <h1
          className="text-[2.4rem] sm:text-[3.2rem] md:text-[4.6rem] font-semibold tracking-[-0.03em] text-[color:var(--apple-ink)] mb-[1.2rem] leading-[1.08] font-display"
          style={layerStyle2d(titleOffset)}
        >
          DeepStudent
        </h1>

        <h2
          className="text-[1.15rem] sm:text-[1.55rem] md:text-[2.05rem] font-display text-[color:var(--apple-ink)] mb-[2.2rem] max-w-2xl mx-auto leading-[1.35]"
          style={layerStyle2d(subtitleOffset)}
        >
          免费开源的 AI 错题管理解决方案
        </h2>

        <p
          className="text-[0.98rem] sm:text-[1.1rem] text-[color:var(--apple-muted)] max-w-lg mb-[3.6rem] leading-[1.7] font-display"
          style={layerStyle2d(textOffset)}
        >
          让学习更高效，让知识更牢固
        </p>

        <div
          className="flex flex-col sm:flex-row gap-[1.618rem] w-full max-w-[17.944rem] sm:max-w-[29.034rem]"
          style={layerStyle2d(ctaOffset)}
        >
          <button
            type="button"
            onClick={onDownload}
            className="focus-ring flex-1 py-[0.95rem] px-[1.5rem] sm:py-[1.15rem] sm:px-[2rem] md:py-[1.35rem] md:px-[2.4rem] bg-black text-white rounded-full font-medium text-sm md:text-base hover:bg-black/85 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-[0.618rem] shadow-[0_18px_40px_rgba(0,0,0,0.25)] ring-1 ring-white/10"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            立即下载
          </button>
          <button className="focus-ring flex-1 py-[0.95rem] px-[1.5rem] sm:py-[1.15rem] sm:px-[2rem] md:py-[1.35rem] md:px-[2.4rem] bg-white/80 text-[color:var(--apple-ink)] border border-white/70 rounded-full font-medium text-sm md:text-base hover:bg-white hover:border-white/80 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-[0.618rem] shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
            <FileText className="w-4 h-4" aria-hidden="true" />
            看看介绍
          </button>
        </div>
      </div>
    </header>
  )
}

const DownloadPage = ({ onBack = () => {} }) => {
  const platformDownloads = [
    {
      id: 'mac',
      platform: 'macOS',
      channel: 'DMG 安装',
      version: 'v1.0.2 · Build 88',
      size: '312 MB',
      requirements: 'macOS 13+，Apple Silicon 优化',
      description: '菜单栏快捷录入，支持 Spotlight 搜索。',
      ctaLabel: '下载 DMG',
      ctaHref: 'https://downloads.deepstudent.ai/macos/deepstudent-v1.0.2.dmg',
      icon: MonitorDot,
      iconBg: 'bg-black text-white',
    },
    {
      id: 'windows',
      platform: 'Windows',
      channel: '预览版',
      version: 'v0.9.8 Preview',
      size: '298 MB',
      requirements: 'Windows 11 / 10 22H2+',
      description: '预览版含 OneNote 导入与系统托盘控件。',
      ctaLabel: '下载 EXE',
      ctaHref: 'https://downloads.deepstudent.ai/windows/deepstudent-setup.exe',
      icon: LaptopMinimal,
      iconBg: 'bg-white text-[color:var(--apple-ink)] border border-black/10',
    },
  ]
  return (
    <div className="relative min-h-screen min-h-[100svh] bg-transparent pb-[6.854rem] sm:pb-[11.09rem]">
      <div className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <button
            type="button"
            onClick={onBack}
            className="focus-ring inline-flex items-center gap-2 text-sm font-medium text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            返回首页
          </button>
          <span className="text-xs text-[color:var(--apple-muted)]">下载</span>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-[3.236rem] sm:pt-[4.236rem] md:pt-[5.854rem] text-center">
        <h1 className="text-[2.2rem] sm:text-[3.2rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          下载 DeepStudent
        </h1>
        <p className="mt-3 text-sm text-[color:var(--apple-muted)] max-w-md mx-auto">
          选择你的平台，安装后即可开始整理。
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-[3.236rem] sm:pt-[4.236rem]">
        <h2 className="text-[1.3rem] sm:text-[1.9rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          选择平台
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {platformDownloads.map((platform) => {
            const Icon = platform.icon
            return (
              <article
                key={platform.id}
                className="rounded-[1.5rem] bg-white/85 border border-black/5 p-[1.5rem] sm:p-[1.75rem] shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
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
                  <span>版本 {platform.version}</span>
                  <span>大小 {platform.size}</span>
                  <span>系统 {platform.requirements}</span>
                </div>

                <div className="mt-4">
                  <a
                    href={platform.ctaHref}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-black/85 active:bg-black/90 transition-colors shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
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

const FeatureSection = ({ icon, title, desc, align, children, motionScale = 1 }) => {
  const { ref, progress, isActive } = useParallaxProgress()
  const contentDirection = align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
  const motionAmount = Math.max(0, motionScale)
  const isStatic = motionAmount === 0
  const shouldAnimate = !isStatic && isActive
  const springProgress = useSpringValue(progress, { stiffness: 175, damping: 19 }, shouldAnimate)
  const easedProgress = easeInOutCubic(progress)
  const focus = Math.sin(easedProgress * Math.PI)
  const juice = Math.pow(focus, 0.65)
  const reveal = isStatic ? 1 : easeOutCubic(clamp((progress - 0.04) / 0.36, 0, 1))
  const offset = (springProgress - 0.5) * motionAmount
  const springDelta = (springProgress - progress) * motionAmount
  const reboundShift = springDelta * 140
  const reboundTilt = springDelta * 12
  const reboundRotate = springDelta * 10
  const reboundDepth = springDelta * 220
  const textShift = offset * (220 + 30 * juice) + reboundShift * 0.28
  const mediaShift = offset * (320 + 70 * juice) + reboundShift
  const depthBase = (0.5 - springProgress) * 230 * motionAmount
  const depthFocus = 0.4 + juice * 0.75
  const mediaDepth = depthBase * depthFocus + 200 * motionAmount * depthFocus + reboundDepth * 0.45
  const mediaTilt = (0.5 - springProgress) * 14 * motionAmount * depthFocus + reboundTilt
  const mediaRotate = offset * 5 + reboundRotate
  const mediaScale = 1 + juice * 0.06 * motionAmount + springDelta * 0.03
  const opacity = isStatic ? 1 : 0.12 + reveal * 0.88

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
          <div className="inline-flex items-center justify-center w-[2.618rem] h-[2.618rem] rounded-[1.618rem] bg-white/80 border border-white/70 shadow-[0_12px_25px_rgba(15,23,42,0.1)] text-[color:var(--apple-ink)] mb-[1.618rem]">
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
      className={`bg-white/85 backdrop-blur-sm sm:backdrop-blur-xl border border-white/60 sm:border-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:shadow-[0_30px_80px_rgba(15,23,42,0.15)] rounded-[1.618rem] p-[1.618rem] sm:p-[2.618rem] w-[17.944rem] aspect-[1/1.618] flex flex-col items-center text-center justify-center relative rotate-1 ${
        shouldAnimate ? 'transition-transform duration-500' : ''
      } hover:rotate-0 active:rotate-0`}
    >
      <div className="absolute top-[1.618rem] left-[1.618rem] w-[0.618rem] h-[0.618rem] bg-black rounded-full" />
      <div
        className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[1.618rem] ${
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
        <div className="text-[1.618rem] font-handwritten text-[color:var(--apple-ink)]">
          ln(x) 的导数是什么？
        </div>
      </div>
      <div className="w-full h-px bg-black/10 my-[2.618rem]" />
      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className="focus-ring relative z-20 text-xs text-[color:var(--apple-muted)] font-medium px-3 py-1.5 rounded-full border border-white/70 bg-white/80 hover:text-[color:var(--apple-ink)] hover:border-white/90 active:text-[color:var(--apple-ink)] active:border-white/90 transition-colors"
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:backdrop-blur-md" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl max-h-[80vh] max-h-[80svh] overflow-y-auto bg-white/85 backdrop-blur-sm sm:backdrop-blur-xl border border-white/60 sm:border-white/70 rounded-[2.618rem] shadow-[0_30px_90px_rgba(15,23,42,0.2)] p-[1.618rem] sm:p-[2.618rem]"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-[2.618rem] mb-[2.618rem]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--apple-muted)] mb-3">
              {type === 'privacy' ? '隐私' : '条款'}
            </p>
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
            className="focus-ring flex-shrink-0 w-[2.618rem] h-[2.618rem] rounded-full border border-white/70 text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] hover:border-white/90 flex items-center justify-center transition-colors bg-white/80"
            aria-label="关闭弹窗"
            ref={closeButtonRef}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6">
          {data.sections.map((section) => (
            <div key={section.title} className="border border-white/70 rounded-[1.618rem] p-[1.618rem] bg-white/70">
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
          className="focus-ring mt-6 w-full py-[0.95rem] sm:py-[1.15rem] md:py-[1.35rem] rounded-[1.618rem] bg-black text-white text-sm md:text-base font-semibold hover:bg-black/85 active:bg-black/90 transition-colors shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
        >
          我已了解
        </button>
      </div>
    </div>
  )
}

const Footer = ({ onOpenPolicy = () => {} }) => (
  <footer className="border-t border-white/60 py-12 px-4 sm:px-6 mt-24 bg-white/75 backdrop-blur-sm sm:backdrop-blur-xl">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2 font-semibold text-[color:var(--apple-ink)]">
        <img src={logo} alt="DeepStudent logo" className="w-5 h-5" />
        DeepStudent
      </div>

      <div className="flex gap-8 text-sm text-[color:var(--apple-muted)] font-medium">
        <button
          type="button"
          onClick={() => onOpenPolicy('privacy')}
          className="focus-ring hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
        >
          隐私
        </button>
        <button
          type="button"
          onClick={() => onOpenPolicy('terms')}
          className="focus-ring hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
        >
          条款
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

      <div className="text-xs text-[color:var(--apple-muted)]">© 2025 DeepStudent Team.</div>
    </div>
  </footer>
)

export default App
