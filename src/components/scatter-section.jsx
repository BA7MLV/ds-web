import { Fragment, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useMediaQuery } from '../hooks/use-media-query'
import { clamp, easeInOut, easeOut, lerp, useScrubProgress } from '../lib/scrub-progress'
import { useLocale } from './locale-toggle'

// 300vh 章节：useScrubProgress 的 progress∈[0.25,0.75] 对应提案 p∈[0,1]（全程动画，节奏同提案）
const SCRUB_START = 0.25
const SCRUB_SPAN = 0.5
const CONVERGE_X = 50 // 汇聚目标（水平 %）
const CONVERGE_Y = 52 // 汇聚目标（垂直 %）

const CHIPS = [
  { label: 'PDF 阅读器', labelKey: 'scatter.chip.pdf', x: 14, y: 24, s: 0.0 },
  { label: 'XMind', x: 74, y: 16, s: 0.12 },
  { label: 'Notion', x: 20, y: 70, s: 0.05 },
  { label: 'Anki', x: 84, y: 58, s: 0.18 },
  { label: 'DeepL', x: 7, y: 48, s: 0.09 },
  { label: 'ChatGPT', x: 66, y: 80, s: 0.22 },
  { label: '学习通', labelKey: 'scatter.chip.xuexitong', x: 42, y: 13, s: 0.03, opt: true },
  { label: 'arXiv', x: 90, y: 36, s: 0.15, opt: true },
  { label: '百度网盘', labelKey: 'scatter.chip.baidu', x: 34, y: 86, s: 0.25, opt: true },
  { label: '知网', labelKey: 'scatter.chip.cnki', x: 57, y: 31, s: 0.07, opt: true },
]

const chipStyle = (chip, p, stageW, stageH) => {
  const t = easeInOut(clamp((p - 0.1 - chip.s * 0.5) / 0.5, 0, 1))
  const dx = lerp(((chip.x - CONVERGE_X) / 100) * stageW, 0, t)
  const dy = lerp(((chip.y - CONVERGE_Y) / 100) * stageH, 0, t)
  const opacity = t < 0.72 ? 1 : 1 - clamp((t - 0.72) / 0.22, 0, 1)
  return {
    transform: `translate(-50%, -50%) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${lerp(1, 0.5, t).toFixed(3)})`,
    opacity: opacity.toFixed(3),
  }
}

export const ScatterSection = () => {
  const { t } = useLocale()
  const { ref, progress } = useScrubProgress()
  const prefersReducedMotion = useReducedMotion()
  const isNarrow = useMediaQuery('(max-width: 700px)')
  const stageRef = useRef(null)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof window === 'undefined') return undefined
    const measure = () => setStageSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (resizeObserver) resizeObserver.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      if (resizeObserver) resizeObserver.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const animated = !prefersReducedMotion
  const p = animated ? clamp((progress - SCRUB_START) / SCRUB_SPAN, 0, 1) : 1

  const headPh = animated ? clamp(p / 0.16, 0, 1) : 0
  const headStyle = {
    opacity: 1 - headPh,
    transform: `translateY(${(-headPh * 24).toFixed(1)}px)`,
    willChange: 'opacity, transform',
  }

  const tw = animated ? easeOut(clamp((p - 0.6) / 0.26, 0, 1)) : 1
  const brandStyle = {
    opacity: tw.toFixed(3),
    transform: `translate(-50%, -50%) scale(${lerp(0.86, 1, tw).toFixed(3)})`,
    willChange: 'opacity, transform',
  }

  const visibleChips = isNarrow ? CHIPS.filter((chip) => !chip.opt) : CHIPS
  const hasStageSize = stageSize.w > 0 && stageSize.h > 0

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: '300vh' }}
      aria-label={t('scatter.title')}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden h-[100dvh]"
      >
        <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-10 text-center">
          <h2
            className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--apple-ink)] sm:text-[3.5rem]"
            style={headStyle}
          >
            {t('scatter.title')
              .split('\n')
              .map((line, i) => (
                <Fragment key={line}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
          </h2>
          <p
            className="mx-auto mt-5 max-w-[560px] text-[18px] leading-[1.55] text-[color:var(--apple-muted)] sm:text-[21px]"
            style={headStyle}
          >
            {t('scatter.desc')}
          </p>
        </div>

        {hasStageSize &&
          visibleChips.map((chip) => {
            const chipLabel = chip.labelKey ? t(chip.labelKey, chip.label) : chip.label
            return (
            <span
              key={chip.label}
              className={`absolute left-1/2 top-[52%] whitespace-nowrap rounded-lg border border-[color:var(--apple-line)] bg-white px-3.5 py-2 text-[14px] text-[color:var(--apple-muted)] dark:bg-[color:var(--apple-card-strong)] ${
                chip.opt ? 'hidden min-[700px]:block' : ''
              } ${animated ? '' : 'hidden'}`}
              style={animated ? chipStyle(chip, p, stageSize.w, stageSize.h) : undefined}
            >
              {chipLabel}
            </span>
            )
          })}

        <div
          className="absolute left-1/2 top-[52%] w-full px-5 text-center"
          style={brandStyle}
        >
          <p className="text-[2.25rem] font-semibold tracking-[-0.02em] text-[color:var(--apple-ink)] sm:text-[4rem]">
            DeepStudent
          </p>
          <p className="mx-auto mt-3.5 max-w-lg text-[16px] leading-relaxed text-[color:var(--apple-muted)] sm:text-[19px]">
            {t('scatter.converge')}
          </p>
        </div>
      </div>
    </section>
  )
}
