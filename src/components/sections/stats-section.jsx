import { useEffect, useRef, useState } from 'react'

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

const StatCard = ({ stat, index, t, shouldAnimate, revealed }) => {
  const entranceClass = shouldAnimate
    ? revealed
      ? 'motion-safe:animate-fade-in-up'
      : 'motion-safe:opacity-0'
    : ''

  return (
    <div
      className={`group relative overflow-hidden rounded-[1.5rem] border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] px-4 py-6 text-center [box-shadow:var(--apple-shadow-sm)] backdrop-blur-xl transition-all duration-300 ease-apple hover:border-[color:var(--apple-line-strong)] hover:[box-shadow:var(--apple-shadow-md)] motion-safe:hover:-translate-y-0.5 sm:rounded-[1.75rem] sm:px-6 sm:py-8 ${entranceClass}`}
      style={shouldAnimate && revealed ? { animationDelay: `${120 + index * 90}ms` } : undefined}
    >
      {/* 顶部发丝高光，与玻璃卡片风格保持一致 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--apple-soft-line)] to-transparent"
      />

      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--apple-blue)] sm:text-[12px]">
        {t(stat.labelKey, stat.labelFallback)}
      </div>

      {/* 数字降一档（36/44/48px）：给单位和说明留出呼吸感，避免窄卡片里数字压满 */}
      <div className="mt-3 font-display text-[2.25rem] font-semibold leading-none tracking-[-0.02em] text-[color:var(--apple-ink)] transition-colors duration-300 group-hover:text-[color:var(--apple-blue)] sm:mt-3.5 sm:text-[2.75rem] lg:text-[3rem]">
        {stat.value}
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
  const shouldAnimate = motionScale > 0
  const { ref, revealed } = useRevealOnce(shouldAnimate)

  const headerEntranceClass = shouldAnimate
    ? revealed
      ? 'motion-safe:animate-fade-in-up'
      : 'motion-safe:opacity-0'
    : ''

  return (
    <section ref={ref} className="px-4 pt-20 sm:px-6 sm:pt-28" aria-labelledby="stats-heading">
      <div className="mx-auto max-w-[80rem]">
        <div className={`mb-10 text-center sm:mb-14 ${headerEntranceClass}`}>
          <h2
            id="stats-heading"
            className="mb-3 font-display text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--apple-ink)] sm:mb-4 sm:text-[2.5rem]"
          >
            {t('stats.title', '为深度学习而生')}
          </h2>
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[color:var(--apple-muted)] sm:text-[17px]">
            {t('stats.subtitle', '从对话入口到数据底座，前后端围绕学习闭环协同设计')}
          </p>
        </div>

        <div className="mx-auto grid max-w-[64rem] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {STATS.map((stat, index) => (
            <StatCard
              key={stat.labelKey}
              stat={stat}
              index={index}
              t={t}
              shouldAnimate={shouldAnimate}
              revealed={revealed}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
