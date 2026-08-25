import { useEffect, useMemo, useRef, useState } from 'react'

import { useLocale } from '../locale-toggle'

// 数字口径与文案、架构图保持一致：
// 1 个对话入口（Chat V2）· 7 类学习资源（Learning Hub）· 11+ 项技能（Skills + Office）· 3 层本地存储（SQLite/LanceDB/Blob）
const STATS = [
  {
    value: '1',
    labelKey: 'stats.tools',
    labelFallback: '对话入口',
    unitKey: 'stats.toolsUnit',
    unitFallback: '个统一入口',
    descKey: 'stats.toolsDesc',
    descFallback: 'Chat V2 统一承载学习任务与协作流程',
  },
  {
    value: '7',
    labelKey: 'stats.providers',
    labelFallback: '资源中枢',
    unitKey: 'stats.providersUnit',
    unitFallback: '类学习资源',
    descKey: 'stats.providersDesc',
    descFallback: 'Learning Hub 统一管理资料与上下文注入',
  },
  {
    value: '11+',
    labelKey: 'stats.modes',
    labelFallback: '能力编排',
    unitKey: 'stats.modesUnit',
    unitFallback: '项技能',
    descKey: 'stats.modesDesc',
    descFallback: '11 项技能 + Office 套件，按任务动态组合',
  },
  {
    value: '3',
    labelKey: 'stats.formats',
    labelFallback: '数据底座',
    unitKey: 'stats.formatsUnit',
    unitFallback: '层本地存储',
    descKey: 'stats.formatsDesc',
    descFallback: '本地 SQLite + LanceDB + Blob 持久化',
  },
]

// 入场节奏：标题先行，副标题微错峰，卡片再依次入场。
// 所有延迟乘以 motionScale，紧凑屏（0.45）下节奏收紧，避免 2 列堆叠时等待感。
const SUBTITLE_DELAY_MS = 70
const CARD_BASE_DELAY_MS = 120
const CARD_STAGGER_MS = 90
const COUNT_UP_DURATION_MS = 900

// Same pattern as hero/faq/mobile-nav: honor the OS setting even when a parent
// forgets to zero out motionScale, and react to live setting changes.
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

// Reveals once when the section scrolls into view, so the entrance
// animation plays where the user can actually see it.
const useRevealOnce = (enabled) => {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(!enabled)

  useEffect(() => {
    if (!enabled || revealed) return
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, revealed])

  return { ref, revealed }
}

// "11+" -> { target: 11, suffix: '+' }；解析失败的值不参与数字动画。
const parseStatValue = (value) => {
  const match = /^(\d+)(.*)$/.exec(value)
  return match ? { target: Number(match[1]), suffix: match[2] } : null
}

// 卡片显现后数字从 0 计数到目标值，延迟与该卡片的入场对齐，
// 让数字在卡片落定的同时跳完。动画关闭或系统减弱动态时直接显示最终值
// （enabled 已折算 prefers-reduced-motion，且随系统设置实时变化）。
const useCountUp = (value, { enabled, revealed, delayMs }) => {
  const parsed = useMemo(() => parseStatValue(value), [value])
  const [count, setCount] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!enabled || !revealed || !parsed || finished) return undefined

    let raf = 0
    let start
    const step = (now) => {
      if (start === undefined) start = now
      const progress = Math.min((now - start) / COUNT_UP_DURATION_MS, 1)
      // ease-out cubic，与站内 apple 缓动的收尾手感接近
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * parsed.target))
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      } else {
        setFinished(true)
      }
    }
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(step)
    }, delayMs)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [enabled, revealed, parsed, delayMs, finished])

  if (!parsed || !enabled || finished) return value
  return `${count}${parsed.suffix}`
}

const StatCard = ({ stat, t, shouldAnimate, revealed, entranceDelayMs }) => {
  const displayValue = useCountUp(stat.value, {
    enabled: shouldAnimate,
    revealed,
    delayMs: entranceDelayMs,
  })

  const entranceClass = shouldAnimate
    ? revealed
      ? 'motion-safe:animate-fade-in-up'
      : 'motion-safe:opacity-0'
    : ''

  return (
    <div
      // 触控设备上 tap 会残留 :hover 态，上浮与阴影加深只在 md+ 生效（同 feature 卡片的处理）
      // 悬停时卡面提亮到 card-hover：暗色下阴影几乎不可见，仅靠描边反馈太弱
      className={`group relative overflow-hidden rounded-[1.5rem] border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] px-4 py-6 text-center [box-shadow:var(--apple-shadow-sm)] backdrop-blur-xl transition-all duration-300 ease-apple hover:border-[color:var(--apple-line-strong)] md:hover:bg-[color:var(--apple-card-hover)] md:hover:[box-shadow:var(--apple-shadow-md)] md:motion-safe:hover:-translate-y-1 sm:rounded-[1.75rem] sm:px-6 sm:py-8 ${entranceClass}`}
      style={shouldAnimate && revealed ? { animationDelay: `${entranceDelayMs}ms` } : undefined}
    >
      {/* 悬停辉光：顶部淡入一层品牌蓝径向光晕（负 z 保证压不住文字） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,var(--apple-blue-soft),transparent_65%)] opacity-0 transition-opacity duration-500 ease-apple md:group-hover:opacity-100"
      />

      {/* 顶部发丝高光，与玻璃卡片风格保持一致 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--apple-soft-line)] to-transparent"
      />
      {/* 悬停时发丝过渡为品牌蓝，与数字变色同步 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--apple-blue)] to-transparent opacity-0 transition-opacity duration-500 ease-apple md:group-hover:opacity-70"
      />

      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--apple-blue)] sm:text-[12px]">
        {t(stat.labelKey, stat.labelFallback)}
      </div>

      {/* 数字降一档（36/44/48px）：给单位和说明留出呼吸感，避免窄卡片里数字压满 */}
      {/* tabular-nums：计数过程中数字宽度稳定，避免行内抖动 */}
      <div className="mt-3 font-display text-[2.25rem] font-semibold leading-none tracking-[-0.02em] tabular-nums text-[color:var(--apple-ink)] transition-colors duration-300 group-hover:text-[color:var(--apple-blue)] sm:mt-3.5 sm:text-[2.75rem] lg:text-[3rem]">
        {displayValue}
      </div>

      <div className="mt-1.5 text-[13px] font-medium text-[color:var(--apple-ink)] sm:mt-2 sm:text-[14px]">
        {t(stat.unitKey, stat.unitFallback)}
      </div>

      <p className="mx-auto mt-2 max-w-[16rem] text-[12px] leading-relaxed text-[color:var(--apple-muted)] sm:mt-2.5 sm:text-[13px]">
        {t(stat.descKey, stat.descFallback)}
      </p>
    </div>
  )
}

export const StatsSection = ({ motionScale = 1 }) => {
  const { t } = useLocale()
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionAmount = Math.max(0, motionScale)
  const shouldAnimate = motionAmount > 0 && !prefersReducedMotion
  const { ref, revealed } = useRevealOnce(shouldAnimate)

  const headerEntranceClass = shouldAnimate
    ? revealed
      ? 'motion-safe:animate-fade-in-up'
      : 'motion-safe:opacity-0'
    : ''
  const delayStyle = (ms) =>
    shouldAnimate && revealed ? { animationDelay: `${Math.round(ms * motionAmount)}ms` } : undefined

  return (
    <section ref={ref} className="px-4 pt-20 sm:px-6 sm:pt-28" aria-labelledby="stats-heading">
      <div className="mx-auto max-w-[80rem]">
        <div className="mb-10 text-center sm:mb-14">
          <h2
            id="stats-heading"
            className={`mb-3 font-display text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--apple-ink)] sm:mb-4 sm:text-[2.5rem] ${headerEntranceClass}`}
          >
            {t('stats.title', '为深度学习而生')}
          </h2>
          <p
            className={`mx-auto max-w-2xl text-[15px] leading-relaxed text-[color:var(--apple-muted)] sm:text-[17px] ${headerEntranceClass}`}
            style={delayStyle(SUBTITLE_DELAY_MS)}
          >
            {t('stats.subtitle', '从对话入口到数据底座，前后端围绕学习闭环协同设计')}
          </p>
        </div>

        <div className="mx-auto grid max-w-[64rem] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {STATS.map((stat, index) => (
            <StatCard
              key={stat.labelKey}
              stat={stat}
              t={t}
              shouldAnimate={shouldAnimate}
              revealed={revealed}
              entranceDelayMs={Math.round(
                (CARD_BASE_DELAY_MS + index * CARD_STAGGER_MS) * motionAmount
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
