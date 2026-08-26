import { useReducedMotion } from 'motion/react'
import { useMediaQuery } from '../hooks/use-media-query'
import { clamp, easeOut, easeOutBack, useScrubProgress } from '../lib/scrub-progress'
import { useLocale } from './locale-toggle'

// 320vh 章节：sticky 窗口对应 scrub 进度 1/4.2 → 3.2/4.2
const SCRUB_START = 0.2381
const SCRUB_SPAN = 0.5238
const NODE_COUNT = 6

const NODE_KEYS = ['node1', 'node2', 'node3', 'node4', 'node5', 'node6']

export const LearningLoop = () => {
  const { t } = useLocale()
  const { ref, progress } = useScrubProgress()
  const prefersReducedMotion = useReducedMotion()
  const isNarrow = useMediaQuery('(max-width: 800px)')

  const animated = !prefersReducedMotion
  const p = animated ? clamp((progress - SCRUB_START) / SCRUB_SPAN, 0, 1) : 1
  const fill = animated ? clamp(p * 1.1, 0, 1) : 1
  const fillTransform = isNarrow
    ? `scaleY(${fill.toFixed(4)})`
    : `scaleX(${fill.toFixed(4)})`

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: '320vh' }}
      aria-label={t('loop.title')}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-[color:var(--apple-band)]">
        <div className="mx-auto w-full max-w-3xl px-5 text-center">
          <h2 className="text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--apple-ink)] sm:text-[2.5rem]">
            {t('loop.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--apple-muted)] sm:text-[17px]">
            {t('loop.desc')}
          </p>
        </div>

        <div className="relative mx-auto mt-12 w-full max-w-6xl px-5 sm:mt-16">
          {/* 轨道：横向 scaleX，窄屏纵向 scaleY */}
          <div
            className="absolute top-[7px] right-[calc(100%/12)] left-[calc(100%/12)] h-[2px] bg-[color:var(--apple-line)] max-[800px]:bottom-[8px] max-[800px]:top-[8px] max-[800px]:left-[7px] max-[800px]:h-auto max-[800px]:w-[2px] max-[800px]:max-w-[420px] max-[800px]:mx-auto"
            aria-hidden="true"
          >
            <div
              className="h-full w-full origin-left bg-[color:var(--apple-blue)] max-[800px]:origin-top"
              style={animated ? { transform: fillTransform } : undefined}
            />
          </div>

          <ol className="relative mx-auto grid grid-cols-6 gap-x-2 max-[800px]:max-w-[420px] max-[800px]:grid-cols-1 max-[800px]:gap-y-8">
            {NODE_KEYS.map((key, index) => {
              const pos = index / (NODE_COUNT - 1)
              const tNode = clamp((fill - pos + 0.03) / 0.07, 0, 1)
              const e = easeOut(tNode)
              const scale = Math.max(0, easeOutBack(tNode))
              const nodeStyle = animated
                ? {
                    opacity: (0.22 + 0.78 * e).toFixed(3),
                    transform: `translateY(${((1 - e) * 10).toFixed(1)}px)`,
                  }
                : undefined
              const dotStyle = animated
                ? { transform: `scale(${scale.toFixed(3)})` }
                : undefined

              return (
                <li
                  key={key}
                  className="px-0 text-center max-[800px]:grid max-[800px]:grid-cols-[16px_1fr] max-[800px]:gap-x-5 max-[800px]:text-left"
                  style={nodeStyle}
                >
                  <span
                    className="relative z-10 mx-auto mb-4 block h-4 w-4 rounded-full border-[3px] border-[color:var(--apple-band)] bg-[color:var(--apple-blue)] shadow-[0_0_0_1px_var(--apple-line)] max-[800px]:mx-0 max-[800px]:mt-[2px] max-[800px]:mb-0"
                    style={dotStyle}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-tight text-[color:var(--apple-ink)]">
                      {t(`loop.${key}.name`)}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--apple-muted)]">
                      {t(`loop.${key}.desc`)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
